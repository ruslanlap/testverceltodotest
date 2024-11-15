// api/server.js
import { Client } from '@notionhq/client';
require('dotenv').config();
import express from 'express';
import cors from 'cors';

const app = express();
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Move checkEnvironmentVariables before its usage
function checkEnvironmentVariables() {
  const requiredVars = ['NOTION_API_KEY', 'YOUR_PAGE_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Setup middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://doapp-ten.vercel.app',
  credentials: true
}));

// Add route for fetching todos
app.get('/api/notion/todos', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: process.env.YOUR_PAGE_ID,
      sorts: [
        {
          property: 'Created',
          direction: 'descending',
        },
      ],
    });

    res.json(response.results);
  } catch (error) {
    console.error('Notion API Error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Initialize server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  checkEnvironmentVariables();
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;