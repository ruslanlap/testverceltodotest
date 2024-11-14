// api/notion/blocks/[...path].ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import cors from "cors";
const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY;

const corsMiddleware = cors({
  origin: "*", // Allow requests from any domain
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Notion-Version"],
  credentials: true,
});
// function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Налаштування CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Notion-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Відповідаємо на preflight запити
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (!NOTION_API_KEY) {
      console.error("NOTION_API_KEY is missing");
      return res.status(500).json({ error: "API key not configured" });
    }

    // Отримуємо шлях з URL
    const pathSegments = req.query.path || [];
    const path = Array.isArray(pathSegments)
      ? pathSegments.join("/")
      : pathSegments;
    const notionUrl = `${NOTION_API_BASE}/blocks/${path}`;

    // Логуємо запит
    console.log("Notion API request:", {
      method: req.method,
      url: notionUrl,
    });

    // Виконуємо запит до Notion API
    const notionResponse = await fetch(notionUrl, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: ["POST", "PATCH"].includes(req.method || "")
        ? JSON.stringify(req.body)
        : undefined,
    });

    // Отримуємо відповідь
    const data = await notionResponse.json();

    // Логуємо відповідь
    console.log("Notion API response:", {
      status: notionResponse.status,
      data: data,
    });

    // Відправляємо відповідь клієнту
    return res.status(notionResponse.status).json(data);
  } catch (error) {
    console.error("Error in API handler:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}