import { VercelRequest, VercelResponse } from '@vercel/node';

const NOTION_API_BASE = 'https://api.notion.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Отримуємо API ключ з env
    const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY;
    if (!NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY is not defined');
    }

    // Отримуємо шлях і параметри
    const pathSegments = req.query.path as string[];
    const path = pathSegments.join('/');

    // Формуємо URL для Notion API
    const notionUrl = `${NOTION_API_BASE}/blocks/${path}`;

    // Налаштовуємо headers для запиту до Notion
    const notionHeaders = {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };

    // Налаштовуємо CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version');

    // Обробляємо OPTIONS запит для CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Виконуємо запит до Notion API
    const notionResponse = await fetch(notionUrl, {
      method: req.method,
      headers: notionHeaders,
      body: ['POST', 'PATCH'].includes(req.method || '') ? JSON.stringify(req.body) : undefined,
    });

    // Отримуємо відповідь
    const data = await notionResponse.json();

    // Відправляємо відповідь клієнту
    return res.status(notionResponse.status).json(data);

  } catch (error) {
    console.error('Error in Notion API:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}