import { Client } from '@notionhq/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import cors from 'cors';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Налаштування CORS middleware
const corsMiddleware = cors({
  origin: ['https://doit-tau.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Notion-Version'],
});

// Helper функція для запуску middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Спочатку запускаємо CORS middleware
  await runMiddleware(req, res, corsMiddleware);

  // Обробка OPTIONS запиту
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;
  switch (method) {
    case 'GET':
      return await handleGet(req, res);
    case 'POST':
      return await handlePatch(req, res);
    case 'DELETE':
      return await handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'OPTIONS']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}