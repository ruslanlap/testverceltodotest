  // pages/api/todos.ts
  import type { NextApiRequest, NextApiResponse } from 'next';
  import { getSession } from 'next-auth/react';
  import { Client } from '@notionhq/client';
  import { getNotionClient } from '../lib/notion';

  interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
  }

  interface NotionTodoProperties {
    Name: {
      title: Array<{
        text: {
          content: string;
        };
      }>;
    };
    Status: {
      checkbox: boolean;
    };
    Created: {
      created_time: string;
    };
  }

  export default async function notionHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      // Перевірка автентифікації
      const session = await getSession({ req });
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const notion = getNotionClient();
      const databaseId = process.env.NOTION_DATABASE_ID;

      if (!databaseId) {
        throw new Error('NOTION_DATABASE_ID is not defined');
      }

      switch (req.method) {
        case 'GET':
          return await getTodos(notion, databaseId, res);
        case 'POST':
          return await createTodo(notion, databaseId, req, res);
        case 'PATCH':
          return await updateTodo(notion, req, res);
        case 'DELETE':
          return await deleteTodo(notion, req, res);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
          return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
      }
    } catch (error) {
      console.error('Notion API Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async function getTodos(
    notion: Client,
    databaseId: string,
    res: NextApiResponse
  ) {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Created',
          direction: 'descending',
        },
      ],
    });

    const todos = response.results.map((page) => {
      const properties = page.properties as NotionTodoProperties;
      return {
        id: page.id,
        text: properties.Name.title[0]?.text.content || '',
        completed: properties.Status.checkbox,
        createdAt: new Date(properties.Created.created_time).getTime(),
      };
    });

    return res.status(200).json({ todos });
  }

  async function createTodo(
    notion: Client,
    databaseId: string,
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: text,
              },
            },
          ],
        },
        Status: {
          checkbox: false,
        },
      },
    });

    const todo: Todo = {
      id: response.id,
      text,
      completed: false,
      createdAt: Date.now(),
    };

    return res.status(201).json(todo);
  }

  async function updateTodo(
    notion: Client,
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const { id } = req.query;
    const { text, completed } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    const properties: any = {};

    if (text !== undefined) {
      properties.Name = {
        title: [
          {
            text: {
              content: text,
            },
          },
        ],
      };
    }

    if (completed !== undefined) {
      properties.Status = {
        checkbox: completed,
      };
    }

    await notion.pages.update({
      page_id: id,
      properties,
    });

    return res.status(200).json({ success: true });
  }

  async function deleteTodo(
    notion: Client,
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    await notion.pages.update({
      page_id: id,
      archived: true,
    });

    return res.status(200).json({ success: true });
  }