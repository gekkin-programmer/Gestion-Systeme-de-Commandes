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
import hotelRoutes from './routes/hotel.routes';
import roomRoutes from './routes/room.routes';
import stayRoutes from './routes/stay.routes';
import departmentRoutes from './routes/department.routes';
import serviceRoutes from './routes/service.routes';
import requestRoutes from './routes/request.routes';
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

app.use(compression());

// ─── Parsing & Logging ───────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use((req, _res, next) => {
  logger.debug({ method: req.method, url: req.originalUrl }, 'Incoming request');
  next();
});

// ─── Rate Limiting ───────────────────────────────────────────────────────────

app.use(globalRateLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────

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
app.use(`${API}/stays`,       stayRoutes);
app.use(`${API}/requests`,    requestRoutes);
app.use(`${API}/payments`,    paymentRoutes);
app.use(`${API}/receipts`,    receiptRoutes);
app.use(`${API}/services`,    serviceRoutes);

// Admin-rate-limited routes
app.use(`${API}/hotels`,      adminRateLimiter, hotelRoutes);
app.use(`${API}/rooms`,       adminRateLimiter, roomRoutes);
app.use(`${API}/departments`, adminRateLimiter, departmentRoutes);
app.use(`${API}/superadmin`,  adminRateLimiter, superadminRoutes);
app.use(`${API}/upload`,      adminRateLimiter, uploadRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────────────────────

app.use(errorHandler);

export default app;
