// server/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client } from "@notionhq/client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for Vercel
const allowedOrigins = [
  'https://your-vercel-app-url.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Validate environment variables
function validateEnv() {
  const requiredEnvVars = ['NOTION_API_KEY', 'NOTION_PAGE_ID'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }

  return {
    notionApiKey: process.env.NOTION_API_KEY!,
    notionPageId: process.env.NOTION_PAGE_ID!
  };
}

const { notionApiKey, notionPageId } = validateEnv();
const notion = new Client({ auth: notionApiKey });

// Routes
app.get('/api/todos', async (req: Request, res: Response) => {
  try {
    const response = await notion.blocks.children.list({
      block_id: notionPageId
    });

    const todos = response.results
      .filter((block: any) => block.type === 'to_do')
      .map((block: any) => ({
        id: block.id,
        text: block.to_do.rich_text[0]?.text?.content || '',
        completed: block.to_do.checked || false,
        createdAt: new Date(block.created_time).getTime(),
      }));

    res.json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await notion.blocks.children.append({
      block_id: notionPageId,
      children: [
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ type: 'text', text: { content: text } }],
            checked: false
          }
        }
      ]
    });

    const newBlock = response.results[0];
    const todo = {
      id: newBlock.id,
      text,
      completed: false,
      createdAt: new Date(newBlock.created_time).getTime(),
    };

    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.patch('/api/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;

    const updateData: any = {
      to_do: {}
    };

    if (text !== undefined) {
      updateData.to_do.rich_text = [{ type: 'text', text: { content: text } }];
    }

    if (completed !== undefined) {
      updateData.to_do.checked = completed;
    }

    await notion.blocks.update({
      block_id: id,
      ...updateData
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await notion.blocks.delete({
      block_id: id
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('CORS enabled for allowed origins');
});

export default app;