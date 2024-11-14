// src/lib/notion.ts

const NOTION_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://doit-tau.vercel.app/api/notion'
  : 'http://localhost:3000/api/notion';

const NOTION_API_KEY = process.env.NOTION_API_KEY;

// Оголошуємо headers один раз
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
};

interface NotionBlock {
  id: string;
  type: string;
  to_do: {
    rich_text: Array<{ text: { content: string } }>;
    checked: boolean;
  };
  created_time: string;
}

interface NotionBlockResponse {
  results: NotionBlock[];
}

// Експортуємо все необхідне
export {
  NOTION_API_URL,
  headers,
  type NotionBlock,
  type NotionBlockResponse
};