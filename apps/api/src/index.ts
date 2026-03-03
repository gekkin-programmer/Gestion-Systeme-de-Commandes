import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { redis, redisSub } from './config/redis';
import { logger } from './config/logger';
import { initializeSocket } from './socket';
import { setSocketServer } from './services/notification.service';

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, 'Shutdown signal received — draining connections');

  // Stop accepting new HTTP connections; finish in-flight requests
  server.close(async () => {
    try {
      await io.close();           // disconnect all Socket.io clients
      await prisma.$disconnect(); // return DB connections to pool
      await redis.quit();         // flush & close pub client
      await redisSub.quit();      // close sub client
      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  });

  // Force exit if drain takes longer than 30 seconds
  setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 30_000);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  },
  pingTimeout: 60_000,
  pingInterval: 25_000,
  // Allow connections to be re-routed without losing subscribed rooms
  // (required when using Redis adapter behind a load balancer without sticky sessions)
  connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
});

// Redis adapter — broadcasts Socket.io events across all cluster workers/servers
io.adapter(createAdapter(redis, redisSub));

initializeSocket(io);
setSocketServer(io);

async function main(): Promise<void> {
  await prisma.$connect();
  logger.info('Database connected');

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'API server started');
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // ─── Hourly Cleanup Jobs ─────────────────────────────────────────────────
  // Delete expired + revoked refresh tokens to keep the table lean
  async function cleanupExpiredTokens(): Promise<void> {
    try {
      const { count } = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { revokedAt: { not: null } },
          ],
        },
      });
      if (count > 0) logger.info({ count }, 'Cleaned up expired/revoked refresh tokens');
    } catch (err) {
      logger.error({ err }, 'Token cleanup failed');
    }
  }

  // Delete expired table sessions (older than TTL)
  async function cleanupExpiredSessions(): Promise<void> {
    try {
      const { count } = await prisma.tableSession.updateMany({
        where: { isActive: true, expiresAt: { lt: new Date() } },
        data:  { isActive: false },
      });
      if (count > 0) logger.info({ count }, 'Deactivated expired table sessions');
    } catch (err) {
      logger.error({ err }, 'Session cleanup failed');
    }
  }

  // Run immediately on boot, then every hour
  void cleanupExpiredTokens();
  void cleanupExpiredSessions();
  setInterval(cleanupExpiredTokens,  60 * 60 * 1000);
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
