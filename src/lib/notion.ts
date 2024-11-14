// src/lib/notion.ts

const NOTION_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://doit-tau.vercel.app/api/notion'
  : 'http://localhost:3000/api/notion';

const NOTION_API_KEY = process.env.NOTION_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version'
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

// Додаємо API функції
export const notionApi = {
  async fetchTodos() {
    const response = await fetch(`${NOTION_API_URL}/todos`, { headers });
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  async createTodo(text: string) {
    const response = await fetch(`${NOTION_API_URL}/todos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  },

  async updateTodo(id: string, updates: { completed?: boolean; text?: string }) {
    const response = await fetch(`${NOTION_API_URL}/todos/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
  },

  async deleteTodo(id: string) {
    const response = await fetch(`${NOTION_API_URL}/todos/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete todo');
    return response.json();
  }
};

export {
  NOTION_API_URL,
  headers,
  type NotionBlock,
  type NotionBlockResponse
};