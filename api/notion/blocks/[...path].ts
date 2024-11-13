// api/notion/blocks/[...path].ts
import { VercelRequest, VercelResponse } from '@vercel/node';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Налаштування CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://doit-tau.vercel.app');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version'
  );

  // Обробка OPTIONS запиту
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Перевірка API ключа
    if (!NOTION_API_KEY) {
      console.error('NOTION_API_KEY is not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Отримання шляху
    const pathSegments = req.query.path || [];
    const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
    const notionUrl = `${NOTION_API_BASE}/blocks/${path}`;

    console.log('Making request to Notion:', {
      url: notionUrl,
      method: req.method,
    });

    // Налаштування запиту до Notion
    const notionHeaders = {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };

    // Виконання запиту
    const notionResponse = await fetch(notionUrl, {
      method: req.method,
      headers: notionHeaders,
      body: ['POST', 'PATCH'].includes(req.method || '') 
        ? JSON.stringify(req.body) 
        : undefined,
    });

    // Перевірка статусу відповіді
    if (!notionResponse.ok) {
      const errorData = await notionResponse.text();
      console.error('Notion API error:', {
        status: notionResponse.status,
        error: errorData
      });
      return res.status(notionResponse.status).json({
        error: 'Notion API error',
        details: errorData
      });
    }

    // Парсинг та відправка відповіді
    const data = await notionResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}