// pages/api/todos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from "@notionhq/client";
import { isFullBlock } from '@notionhq/client';
import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type NotionTodoBlock = BlockObjectResponse & {
  type: 'to_do';
  to_do: {
    rich_text: Array<{
      text: {
        content: string;
      };
    }>;
    checked: boolean;
  };
};

// Validate environment variables on startup
function validateEnv() {
  const requiredEnvVars = ['NOTION_API_KEY', 'NOTION_PAGE_ID'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }

  return {
    notionApiKey: process.env.NOTION_API_KEY!,
    notionPageId: process.env.NOTION_PAGE_ID!
  };
}

// Initialize Notion client with validation
const { notionApiKey, notionPageId } = validateEnv();
const notion = new Client({ auth: notionApiKey });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET /api/todos
    if (req.method === 'GET') {
      console.log('Fetching todos...');
      const response = await notion.blocks.children.list({
        block_id: notionPageId // Fixed: using notionPageId instead of pageId
      });

      const todos = response.results
        .filter((block): block is NotionTodoBlock => 
          isFullBlock(block) && block.type === 'to_do')
        .map((block) => ({
          id: block.id,
          text: block.to_do.rich_text[0]?.text?.content || '',
          completed: block.to_do.checked || false,
          createdAt: new Date(block.created_time).getTime(),
        }));

      console.log('Returning todos:', todos);
      return res.status(200).json({ todos });
    }

    // POST /api/todos
    if (req.method === 'POST') {
      const { text } = req.body as { text?: string };

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const response = await notion.blocks.children.append({
        block_id: notionPageId, // Fixed: using notionPageId instead of pageId
        children: [
          {
            object: 'block',
            type: 'to_do',
            to_do: {
              rich_text: [
                {
                  type: 'text',
                  text: { content: text }
                }
              ],
              checked: false
            }
          }
        ]
      });

      const newBlock = response.results[0];

      if (isFullBlock(newBlock) && newBlock.type === 'to_do') {
        const todo: Todo = {
          id: newBlock.id,
          text,
          completed: false,
          createdAt: new Date(newBlock.created_time).getTime(),
        };
        return res.status(200).json(todo);
      }

      throw new Error('Invalid response from Notion API');
    }

    // PATCH /api/todos?id={id}
    if (req.method === 'PATCH') {
      const { id } = req.query;
      const { text, completed } = req.body as { text?: string; completed?: boolean };

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid todo ID' });
      }

      const updateData = {
        to_do: {} as {
          rich_text?: Array<{ type: 'text'; text: { content: string } }>;
          checked?: boolean;
        }
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
        block_id: id,
        ...updateData
      });

      return res.status(200).json({ success: true });
    }

    // DELETE /api/todos?id={id}
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid todo ID' });
      }

      await notion.blocks.delete({
        block_id: id
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}