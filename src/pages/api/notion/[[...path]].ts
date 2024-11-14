// src/pages/api/notion/[[...path]].ts
import { NextApiRequest, NextApiResponse } from 'next';

const NOTION_API_BASE_URL = 'https://api.notion.com/v1';
const NOTION_API_KEY = process.env.NOTION_API_KEY; // Remove VITE_ prefix
const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID; // Remove VITE_ prefix

async function handleNotionRequest(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://doit-tau.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extract the path parameters
    const pathSegments = req.query.path || [];
    const apiPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;

    // Construct the full Notion API URL
    const notionUrl = `${NOTION_API_BASE_URL}/${apiPath}`;
    console.log('Calling Notion API:', notionUrl);

    // Forward the request to Notion API
    const notionResponse = await fetch(notionUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // Log the response status
    console.log('Notion API response status:', notionResponse.status);

    // If the response is not ok, log the error
    if (!notionResponse.ok) {
      const errorData = await notionResponse.text();
      console.error('Notion API error:', errorData);
      res.status(notionResponse.status).json({ error: errorData });
      return;
    }

    // Get the response data
    const data = await (notionResponse.status === 204 ? Promise.resolve(null) : notionResponse.json());

    // Send the response
    res.status(notionResponse.status);
    if (data) {
      res.json(data);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('API Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

export default handleNotionRequest;

export const config = {
  api: {
    bodyParser: true,
  },
};