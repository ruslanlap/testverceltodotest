import { Client } from '@notionhq/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case 'GET':
      return await handleGet(req, res);
    case 'PATCH':
      return await handlePatch(req, res);
    case 'DELETE':
      return await handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<GetPageResponse | { error: string }>
) {
  const { pageId } = req.query;
  try {
    const response = await notion.pages.retrieve({ page_id: pageId as string });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
}

async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse<GetPageResponse | { error: string }>
) {
  const { pageId } = req.query;
  const { properties } = req.body;
  try {
    const response = await notion.pages.update({
      page_id: pageId as string,
      properties,
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<void | { error: string }>
) {
  const { pageId } = req.query;
  try {
    await notion.pages.update({
      page_id: pageId as string,
      archived: true
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
}