import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Append connection_limit to DATABASE_URL for Prisma's built-in pool.
// Each Node process holds up to DATABASE_POOL_SIZE connections to PostgreSQL.
// With PM2 cluster (N workers), total DB connections = N × DATABASE_POOL_SIZE.
// Size accordingly: for PG max_connections=100 and 4 workers → use 20.
function buildDatabaseUrl(): string {
  const base = env.DATABASE_URL;
  const sep  = base.includes('?') ? '&' : '?';
  return `${base}${sep}connection_limit=${env.DATABASE_POOL_SIZE}&pool_timeout=10`;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: buildDatabaseUrl() } },
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
