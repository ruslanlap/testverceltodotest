// api/notion.js
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req, res) {
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

async function handleGet(req, res) {
  const { pageId } = req.query; // Assuming you're passing the page ID in the query
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function handlePatch(req, res) {
  const { pageId } = req.query; // Assuming you're passing the page ID in the query
  const { properties } = req.body; // Assuming properties are sent in the request body
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties,
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function handleDelete(req, res) {
  const { pageId } = req.query; // Assuming you're passing the page ID in the query
  try {
    await notion.pages.delete({ page_id: pageId });
    res.status(204).end(); // No content
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}