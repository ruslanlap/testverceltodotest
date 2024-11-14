// src/pages/api/notion/[[...path]].ts
import { NextApiRequest, NextApiResponse } from 'next';

const NOTION_API_BASE_URL = 'https://api.notion.com/v1';
const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extract the path parameters
    const pathSegments = req.query.path || [];
    const apiPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;

    // Forward the request to Notion API
    const notionResponse = await fetch(`${NOTION_API_BASE_URL}/${apiPath}`, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // Get the response data
    const data = await (notionResponse.status === 204 ? Promise.resolve(null) : notionResponse.json());

    // Forward the status code and response
    res.status(notionResponse.status);

    if (data) {
      res.json(data);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Notion API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};