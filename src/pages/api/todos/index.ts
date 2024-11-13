import type { NextApiRequest, NextApiResponse } from 'next';

import { notionApi } from '@/lib/notion';

export default async function handler(

  req: NextApiRequest,

  res: NextApiResponse

) {

  try {

    switch (req.method) {

      case 'GET':

        const todos = await notionApi.fetchTodos();

        return res.status(200).json({ todos });

      case 'POST':

        const { text } = req.body;

        if (!text) {

          return res.status(400).json({ error: 'Text is required' });

        }

        const newTodo = await notionApi.createTodo(text);

        return res.status(201).json(newTodo);

      default:

        res.setHeader('Allow', ['GET', 'POST']);

        return res.status(405).end(`Method ${req.method} Not Allowed`);

    }

  } catch (error) {

    console.error('API Error:', error);

    return res.status(500).json({ error: 'Internal Server Error' });

  }

}