// src/server.js
import { Client } from '@notionhq/client'; // For ES Module syntax
// or
// const { Client } = require('@notionhq/client'); // For CommonJS syntax

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

app.use(express.json());
app.use(cors());

// Middleware для логування
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware для перевірки наявності необхідних змінних середовища
const checkEnvironmentVariables = () => {
  const requiredVars = ['NOTION_API_KEY', 'YOUR_PAGE_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Базовий маршрут для перевірки API
app.get('/api/notion', (req, res) => {
  res.json({ message: 'Notion API is working' });
});

// Отримання всіх blocks з Notion сторінки
app.get('/api/notion/blocks/:pageId/children', async (req, res) => {
  try {
    checkEnvironmentVariables();
    const { pageId } = req.params;

    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Створення нового block
app.patch('/api/notion/blocks/:pageId/children', async (req, res) => {
  try {
    checkEnvironmentVariables();
    const { pageId } = req.params;
    const { children } = req.body;

    const response = await notion.blocks.children.append({
      block_id: pageId,
      children: children
    });

    res.json(response);
  } catch (error) {
    console.error('Error creating block:', error);
    res.status(500).json({ error: error.message });
  }
});

// Оновлення block
app.patch('/api/notion/blocks/:blockId', async (req, res) => {
  try {
    checkEnvironmentVariables();
    const { blockId } = req.params;
    const updates = req.body;

    const response = await notion.blocks.update({
      block_id: blockId,
      ...updates
    });

    res.json(response);
  } catch (error) {
    console.error('Error updating block:', error);
    res.status(500).json({ error: error.message });
  }
});

// Видалення block
app.delete('/api/notion/blocks/:blockId', async (req, res) => {
  try {
    checkEnvironmentVariables();
    const { blockId } = req.params;

    const response = await notion.blocks.delete({
      block_id: blockId
    });

    res.json(response);
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('GET    /api/notion');
  console.log('GET    /api/notion/blocks/:pageId/children');
  console.log('PATCH  /api/notion/blocks/:pageId/children');
  console.log('PATCH  /api/notion/blocks/:blockId');
  console.log('DELETE /api/notion/blocks/:blockId');
});