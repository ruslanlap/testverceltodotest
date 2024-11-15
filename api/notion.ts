import { Client } from "@notionhq/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { GetPageResponse } from "@notionhq/client/build/src/api-endpoints";
import Cors from "cors";

// Ініціалізація Notion клієнта з іншим параметром
const notion = new Client({ auth: process.env.NOTION_API_KEY, timeoutMs: 30000 });

// Ініціалізація CORS middleware
const corsMiddleware = Cors({
  origin: ["https://doit-tau.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Notion-Version"],
});

// Helper функція для запуску middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function,
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Запуск CORS middleware
  await runMiddleware(req, res, corsMiddleware);

  const { method } = req;

  switch (method) {
    case "GET":
      await handleGet(req, res);
      break;
    case "POST":
      await handlePatch(req, res);
      break;
    case "DELETE":
      await handleDelete(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "OPTIONS"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}