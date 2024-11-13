// src/pages/api/todos/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';
import { Todo, ApiResponse } from '../../../types';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, data: null, error: 'Invalid block ID' });
  }

  if (req.method === 'PATCH') {
    try {
      const { title, completed } = req.body;

      if (!title && completed === undefined) {
        return res.status(400).json({ success: false, data: null, error: 'Invalid update data' });
      }

      const block = await notion.blocks.retrieve({
        block_id: id
      });

      if (!('type' in block) || block.type !== 'to_do') {
        return res.status(400).json({ success: false, data: null, error: 'Block is not a todo item' });
      }

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
      return res.status(500).json({ success: false, data: null, error: 'Failed to update todo' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await notion.blocks.delete({
        block_id: id
      });
      return res.status(200).json({ success: true, data: null });
    } catch (error) {
      console.error('Error deleting todo:', error);
      return res.status(500).json({ success: false, data: null, error: 'Failed to delete todo' });
    }
  }

  return res.status(405).json({ success: false, data: null, error: 'Method not allowed' });
}
