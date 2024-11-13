import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const PAGE_ID = process.env.NOTION_PAGE_ID;

type TodoResponse = {
  success?: boolean;
  error?: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodoResponse>
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid block ID' });
  }

  // Обробка PATCH запиту (оновлення todo)
  if (req.method === 'PATCH') {
    try {
      const { title, completed } = req.body;

      if (!title && completed === undefined) {
        return res.status(400).json({ error: 'Invalid update data' });
      }

      // Спочатку отримуємо поточний блок, щоб перевірити його тип
      const block = await notion.blocks.retrieve({
        block_id: id
      });

      if (block.type !== 'to_do') {
        return res.status(400).json({ error: 'Block is not a todo item' });
      }

      // Оновлюємо to-do блок
      const response = await notion.blocks.update({
        block_id: id,
        to_do: {
          checked: completed !== undefined ? completed : block.to_do.checked,
          rich_text: title ? [
            {
              type: 'text',
              text: {
                content: title,
              },
            },
          ] : block.to_do.rich_text,
        },
      });

      return res.status(200).json({ 
        success: true, 
        data: response 
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      return res.status(500).json({ error: 'Failed to update todo' });
    }
  }

  // Обробка DELETE запиту (видалення todo)
  if (req.method === 'DELETE') {
    try {
      // Видаляємо блок
      await notion.blocks.delete({
        block_id: id
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting todo:', error);
      return res.status(500).json({ error: 'Failed to delete todo' });
    }
  }

  // Якщо метод не підтримується
  return res.status(405).json({ error: 'Method not allowed' });
}