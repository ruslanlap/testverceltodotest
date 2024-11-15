import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const pageId = process.env.NOTION_PAGE_ID;

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const response = await notion.blocks.children.list({
          block_id: pageId,
          page_size: 100,
        });

        const todos: Todo[] = response.results
          .filter(block => block.type === 'to_do')
          .map(block => ({
            id: block.id,
            text: block.to_do.rich_text[0]?.plain_text ?? '',
            completed: block.to_do.checked ?? false,
            createdAt: new Date(block.created_time).getTime(),
          }));

        return res.status(200).json(todos);

      case 'POST':
        const { text } = req.body;
        const newBlock = await notion.blocks.children.append({
          block_id: pageId,
          children: [{
            type: 'to_do',
            to_do: {
              rich_text: [{ type: 'text', text: { content: text } }],
              checked: false,
            },
          }],
        });

        const newTodo = newBlock.results[0];
        return res.status(201).json({
          id: newTodo.id,
          text,
          completed: false,
          createdAt: new Date(newTodo.created_time).getTime(),
        });

      case 'PATCH':
        const { id } = req.query;
        const updates = req.body;

        await notion.blocks.update({
          block_id: id as string,
          to_do: {
            ...(updates.text && { rich_text: [{ type: 'text', text: { content: updates.text } }] }),
            ...(updates.completed !== undefined && { checked: updates.completed }),
          },
        });

        return res.status(200).json({ message: 'Updated successfully' });

      case 'DELETE':
        await notion.blocks.delete({
          block_id: req.query.id as string,
        });

        return res.status(200).json({ message: 'Deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Notion API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}