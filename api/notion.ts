import { Client } from "@notionhq/client";
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

const notion = new Client({ 
  auth: process.env.NOTION_API_KEY,
  timeoutMs: 30000 
});

const cors = Cors({
  origin: "https://doapp-ten.vercel.app",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Notion-Version"],
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case "GET":
        // Get page content instead of database query
        const response = await notion.blocks.children.list({
          block_id: process.env.YOUR_PAGE_ID as string,
        });
        return res.status(200).json(response);

      case "POST":
        // Add a new todo to the page
        const { text } = req.body;
        const newBlock = await notion.blocks.children.append({
          block_id: process.env.YOUR_PAGE_ID as string,
          children: [
            {
              type: "to_do",
              to_do: {
                rich_text: [{ type: "text", text: { content: text } }],
                checked: false,
              },
            },
          ],
        });
        return res.status(201).json(newBlock);

      case "PATCH":
        // Update a todo
        const { id, checked, text: updatedText } = req.body;
        const updatedBlock = await notion.blocks.update({
          block_id: id,
          to_do: {
            checked,
            rich_text: updatedText ? [{ type: "text", text: { content: updatedText } }] : undefined,
          },
        });
        return res.status(200).json(updatedBlock);

      case "DELETE":
        // Delete a todo
        const { blockId } = req.query;
        await notion.blocks.delete({
          block_id: blockId as string,
        });
        return res.status(200).json({ success: true });

      default:
        res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error processing request" });
  }
}