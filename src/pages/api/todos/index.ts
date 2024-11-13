// src/pages/api/todos/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';
import { Todo, ApiResponse, NotionTodoBlock } from '../../../types';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const PAGE_ID = process.env.NOTION_PAGE_ID;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Todo | Todo[]>>
) {
  if (req.method === 'GET') {
    try {
      const response = await notion.blocks.children.list({
        block_id: PAGE_ID!
      });

      const todos: Todo[] = response.results
        .filter((block): block is NotionTodoBlock => 
          'type' in block && block.type === 'to_do'
        )
        .map(block => ({
          id: block.id,
          text: block.to_do.rich_text[0]?.text.content || '',
          completed: block.to_do.checked,
          createdAt: new Date(block.created_time).getTime()
        }));

      return res.status(200).json({ success: true, data: todos });
    } catch (error) {
      return res.status(500).json({ success: false, data: [], error: 'Failed to fetch todos' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { text } = req.body;

      const response = await notion.blocks.children.append({
        block_id: PAGE_ID!,
        children: [
          {
            type: 'to_do',
            to_do: {
              rich_text: [{ type: 'text', text: { content: text } }],
              checked: false,
            },
          },
        ],
      });

      const newBlock = response.results[0] as NotionTodoBlock;

      const newTodo: Todo = {
        id: newBlock.id,
        text,
        completed: false,
        createdAt: new Date(newBlock.created_time).getTime()
      };

      return res.status(201).json({ success: true, data: newTodo });
    } catch (error) {
      return res.status(500).json({ success: false, data: null, error: 'Failed to create todo' });
    }
  }

  return res.status(405).json({ success: false, data: null, error: 'Method not allowed' });
}