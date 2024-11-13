// src/pages/api/todos/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

import { notionApi } from '@/lib/notion';

export default async function handler(

  req: NextApiRequest,

  res: NextApiResponse

) {

  const { id } = req.query;



  if (!id || typeof id !== 'string') {

    return res.status(400).json({ error: 'Invalid todo ID' });

  }

  try {

    switch (req.method) {

      case 'PATCH':

        const { text, completed } = req.body;

        const success = await notionApi.updateTodo(id, { text, completed });

        return res.status(200).json({ success });

      case 'DELETE':

        const deleted = await notionApi.deleteTodo(id);

        return res.status(200).json({ success: deleted });

      default:

        res.setHeader('Allow', ['PATCH', 'DELETE']);

        return res.status(405).end(`Method ${req.method} Not Allowed`);

    }

  } catch (error) {

    console.error('API Error:', error);

    return res.status(500).json({ error: 'Internal Server Error' });

  }

}