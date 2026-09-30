import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

import { prisma } from './lib/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Security & Parsing Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Dynamic CORS Configuration (Supports Vercel previews & production domains)
const configuredClientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5050',
  'http://127.0.0.1:5173',
  ...configuredClientUrls,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, and server-to-server requests
      if (!origin) return callback(null, true);

      const isVercelDomain = /\.vercel\.app$/.test(origin);
      const isConfigured = defaultOrigins.includes(origin.replace(/\/+$/, ''));

      if (isConfigured || isVercelDomain || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (Includes live database connectivity check)
app.get('/api/health', async (req: Request, res: Response) => {
  let dbStatus = 'DISCONNECTED';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'CONNECTED';
  } catch (err: any) {
    dbStatus = `ERROR: ${err.message}`;
  }

  res.status(200).json({
    status: 'ONLINE',
    service: 'ROVIN Precision E-Commerce Core API',
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/orders', orderRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[ROVIN Core Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start listening if not imported as module
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ROVIN API] Server running on http://localhost:${PORT}`);
  });
}

export default app;
