// api/server.js
import { Client } from '@notionhq/client';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const notion = new Client({ auth: process.env.NOTION_API_KEY });
checkEnvironmentVariables();
app.use(express.json());
app.use(cors());

const checkEnvironmentVariables = () => {
  const requiredVars = ['NOTION_API_KEY', 'YOUR_PAGE_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Run this check once at startup
checkEnvironmentVariables();

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Add your routes here...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});