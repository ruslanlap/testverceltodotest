import type { NextApiRequest, NextApiResponse } from 'next';
import { Todo } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Тут ваша логіка отримання todos
      const todos: Todo[] = []; // Замініть на реальну логіку
      return res.status(200).json({ todos });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch todos' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      // Тут ваша логіка створення todo
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: Date.now()
      };
      return res.status(201).json(newTodo);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create todo' });
    }
  }
}