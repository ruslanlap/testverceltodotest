import { VercelRequest, VercelResponse } from '@vercel/node';

import { Client } from '@notionhq/client';

import cors from 'cors';

import { runMiddleware } from '../src/lib/middleware';

// Initialize Notion client

const notion = new Client({

  auth: process.env.NOTION_API_KEY,

});

// CORS configuration

const corsMiddleware = cors({

  origin: process.env.FRONTEND_URL || '*',

  methods: ['GET', 'POST', 'PATCH', 'DELETE'],

  credentials: true,

});

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // Run CORS middleware

  await runMiddleware(req, res, corsMiddleware);

  const { method } = req;

  const pageId = process.env.YOUR_PAGE_ID;

  try {

    switch (method) {

      case 'GET':

        const { results } = await notion.blocks.children.list({

          block_id: pageId,

        });

        return res.status(200).json({ results });

      case 'PATCH':

        if (req.query.blockId) {

          // Update existing todo

          const response = await notion.blocks.update({

            block_id: req.query.blockId as string,

            ...req.body,

          });

          return res.status(200).json(response);

        } else {

          // Create new todo

          const response = await notion.blocks.children.append({

            block_id: pageId,

            children: req.body.children,

          });

          return res.status(201).json(response);

        }

      case 'DELETE':

        const blockId = req.query.blockId as string;

        await notion.blocks.delete({

          block_id: blockId,

        });

        return res.status(200).json({ success: true });

      default:

        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);

        return res.status(405).end(`Method ${method} Not Allowed`);

    }

  } catch (error) {

    console.error('Notion API Error:', error);

    return res.status(500).json({ error: 'Internal Server Error' });

  }

}