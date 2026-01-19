import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/router.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Завантаження змінних середовища
dotenv.config();

// Ініціалізація Express
const app = express();

// Підключення до MongoDB
connectDB();

// CORS налаштування
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Дозволити запити без origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Головний route
app.get('/', (req, res) => {
  res.json({
    message: '🛍️ E-Commerce API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      orders: '/api/orders',
      cart: '/api/cart'
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║    Server running on port ${PORT}       ║
║    Environment: ${process.env.NODE_ENV || 'development'}          ║
║    URL: http://localhost:${PORT}        ║
╚══════════════════════════════════════╝
  `);
});

export default app;
