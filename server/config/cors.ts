// server/config/cors.ts
import cors from 'cors';
import { CorsOptions } from 'cors';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',  // Vite default
  'http://127.0.0.1:5173',
  'http://localhost:3000',  // Додаткові порти якщо потрібно
  // Додайте URL продакшн середовища коли буде готово
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Дозволяємо запити без origin (наприклад, з Postman або мобільних додатків)
    if (!origin) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 86400, // 24 години
  optionsSuccessStatus: 200
};

// Middleware для CORS
export const corsMiddleware = cors(corsOptions);

// Утиліта для додавання CORS заголовків вручну якщо потрібно
export const addCorsHeaders = (req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGINS.join(', '));
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
};