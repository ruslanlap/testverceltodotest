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
const notion = new Client({ 
  auth: process.env.NOTION_API_KEY,
  notionVersion: '2022-06-28' // Додайте явну версію API
});

// CORS налаштування для Vercel
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://doit-tau.vercel.app'] 
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Notion-Version'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Перевірка змінних середовища при старті
const checkEnvironmentVariables = () => {
  const requiredVars = ['NOTION_API_KEY', 'YOUR_PAGE_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

checkEnvironmentVariables();

// Ваші існуючі маршрути...

// Обробка помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message 
  });
});

// Експорт для Vercel
export default app;

// Запуск сервера тільки якщо не на Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}