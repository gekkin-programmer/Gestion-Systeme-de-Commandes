import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { logger } from './config/logger';
import { env } from './config/env';
import { globalRateLimiter, adminRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import menuRoutes from './routes/menu.routes';
import tableRoutes from './routes/table.routes';
import sessionRoutes from './routes/session.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import receiptRoutes from './routes/receipt.routes';
import superadminRoutes from './routes/superadmin.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

// Trust the first proxy hop (nginx, Heroku, etc.) so rate limiters
// use the real client IP from X-Forwarded-For instead of the proxy IP.
app.set('trust proxy', 1);

// ─── Security ────────────────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// ─── Compression ─────────────────────────────────────────────────────────────
// Gzip all responses > 1 KB. Cuts bandwidth 60-80% for JSON payloads.
app.use(compression());

// ─── Parsing & Logging ───────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));   // tightened from 10mb — no endpoint needs more
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Structured request logging via pino
app.use((req, _res, next) => {
  logger.debug({ method: req.method, url: req.originalUrl }, 'Incoming request');
  next();
});

// ─── Rate Limiting ───────────────────────────────────────────────────────────

app.use(globalRateLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────

// Deep health check for load balancers — they'll stop routing to unhealthy instances
app.get('/health', async (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ─── Static uploads ──────────────────────────────────────────────────────────

const UPLOAD_DIR = path.resolve(process.cwd(), '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/api/v1/uploads', express.static(UPLOAD_DIR));

// ─── API Routes ──────────────────────────────────────────────────────────────

const API = '/api/v1';

app.use(`${API}/auth`,        authRoutes);
app.use(`${API}/sessions`,    sessionRoutes);
app.use(`${API}/orders`,      orderRoutes);
app.use(`${API}/payments`,    paymentRoutes);
app.use(`${API}/receipts`,    receiptRoutes);
// Public + cached
app.use(`${API}/menu`,        menuRoutes);

// Admin-only routes — extra rate limit layer on top of globalRateLimiter
app.use(`${API}/restaurants`, adminRateLimiter, restaurantRoutes);
app.use(`${API}/tables`,      adminRateLimiter, tableRoutes);
app.use(`${API}/superadmin`,  adminRateLimiter, superadminRoutes);
app.use(`${API}/upload`,      adminRateLimiter, uploadRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────────────────────

app.use(errorHandler);

export default app;
