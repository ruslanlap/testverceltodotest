// server/index.ts
import express from 'express';
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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

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

// Middlewares
app.use(corsMiddleware); // Використовуємо CORS конфігурацію
app.use(express.json());

// Routes залишаються такими ж...

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for allowed origins`);
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

export default app;