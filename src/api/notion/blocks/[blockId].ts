import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { blockId } = req.query;
  const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY;

  try {
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${blockId}`,
      {
        method: req.method,
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}