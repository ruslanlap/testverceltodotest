// pages/api/notion/todos.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from "@notionhq/client";
import cors from 'cors';

const notion = new Client({ 
  auth: process.env.NOTION_API_KEY 
});

// Налаштування CORS
const corsMiddleware = cors({
  origin: 'https://doapp-ten.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Notion-Version'],
});

// Middleware helper
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Застосовуємо CORS
    await runMiddleware(req, res, corsMiddleware);

    // Перевіряємо наявність необхідних змінних середовища
    if (!process.env.NOTION_API_KEY || !process.env.YOUR_PAGE_ID) {
      throw new Error('Missing required environment variables');
    }

    switch (req.method) {
      case 'OPTIONS':
        return res.status(200).end();

      case 'GET':
        const response = await notion.blocks.children.list({
          block_id: process.env.YOUR_PAGE_ID,
        });
        return res.status(200).json(response);

      case 'POST':
        const { text } = req.body;
        if (!text) {
          return res.status(400).json({ error: 'Text is required' });
        }

        const newBlock = await notion.blocks.children.append({
          block_id: process.env.YOUR_PAGE_ID,
          children: [{
            object: 'block',
            type: 'to_do',
            to_do: {
              rich_text: [{ type: 'text', text: { content: text } }],
              checked: false,
            },
          }],
        });
        return res.status(201).json(newBlock);

      default:
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};