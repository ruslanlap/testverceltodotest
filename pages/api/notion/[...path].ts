// pages/api/notion/[...path].ts
import { NextApiRequest, NextApiResponse } from 'next';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_BASE_URL = 'https://api.notion.com/v1';

if (!NOTION_API_KEY) {
  throw new Error('Missing NOTION_API_KEY environment variable');
}

const headers = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;

  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  const [action, blockId] = path;
  const PAGE_ID = process.env.NOTION_PAGE_ID;

  try {
    let response;

    switch (req.method) {
      case 'GET':
        if (action === 'blocks') {
          response = await fetch(`${NOTION_BASE_URL}/blocks/${PAGE_ID}/children`, {
            method: 'GET',
            headers
          });
        }
        break;

      case 'PATCH':
        if (action === 'blocks' && !blockId) {
          // Create todo
          response = await fetch(`${NOTION_BASE_URL}/blocks/${PAGE_ID}/children`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(req.body)
          });
        } else if (action === 'blocks' && blockId) {
          // Update todo
          response = await fetch(`${NOTION_BASE_URL}/blocks/${blockId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(req.body)
          });
        }
        break;

      case 'DELETE':
        if (action === 'blocks' && blockId) {
          response = await fetch(`${NOTION_BASE_URL}/blocks/${blockId}`, {
            method: 'DELETE',
            headers
          });
        }
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!response) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}