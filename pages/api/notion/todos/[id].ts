// pages/api/notion/todos/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from "@notionhq/client";

if (!process.env.NOTION_API_KEY) {
  throw new Error('NOTION_API_KEY is not defined');
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    // PATCH /api/notion/todos/[id]
    if (req.method === 'PATCH') {
      const { text, completed } = req.body;

      const updateData: any = {
        to_do: {}
      };

      if (text !== undefined) {
        updateData.to_do.rich_text = [
          {
            type: 'text',
            text: { content: text }
          }
        ];
      }

      if (completed !== undefined) {
        updateData.to_do.checked = completed;
      }

      await notion.blocks.update({
        block_id: id as string,
        ...updateData
      });

      return res.status(200).json({ success: true });
    }

    // DELETE /api/notion/todos/[id]
    if (req.method === 'DELETE') {
      await notion.blocks.delete({
        block_id: id as string
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}