
// src/pages/api/notion/[[...path]].ts
import { NextApiRequest, NextApiResponse } from 'next';

const NOTION_API_BASE_URL = 'https://api.notion.com/v1';
const NOTION_API_KEY = process.env.NOTION_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!NOTION_API_KEY) {
    res.status(500).json({ error: 'Notion API key not configured' });
    return;
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'https://doit-tau.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const pathSegments = req.query.path || [];
    const apiPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;

    const notionResponse = await fetch(`${NOTION_API_BASE_URL}/${apiPath}`, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    if (!notionResponse.ok) {
      const errorText = await notionResponse.text();
      console.error('Notion API Error:', {
        status: notionResponse.status,
        text: errorText,
        path: apiPath
      });
      res.status(notionResponse.status).json({ error: errorText });
      return;
    }

    const data = await (notionResponse.status === 204 ? Promise.resolve(null) : notionResponse.json());

    if (data) {
      res.status(notionResponse.status).json(data);
    } else {
      res.status(notionResponse.status).end();
    }
  } catch (error: unknown) {
    console.error('API Handler Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};