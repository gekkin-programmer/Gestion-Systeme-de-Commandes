# Production Deployment Guide

## Required environment variables (apps/api/.env)

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/restaurant_db
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=<64-char random string>
JWT_REFRESH_SECRET=<64-char random string>
DATABASE_POOL_SIZE=20   # connections per worker; total = workers × this
CORS_ORIGINS=https://yourdomain.com
```

## Database migration (run once before starting)

```bash
docker-compose up -d db redis
pnpm --filter api db:migrate:prod   # applies pending migrations safely
```

## Running in production (PM2 cluster)

```bash
cd apps/api
pnpm build                          # compile TypeScript
pm2 start ecosystem.config.js --env production
pm2 save                            # persist across reboots
pm2 startup                         # auto-start on boot
```

## Zero-downtime reload

```bash
pm2 reload restaurant-api           # rolling restart, no downtime
```

## Scaling guide

| Concurrent users | Workers | DATABASE_POOL_SIZE | PG max_connections |
|-----------------|---------|-------------------|-------------------|
| ~10k            | 2       | 15                | 50                |
| ~50k            | 4       | 15                | 100               |
| ~100k+          | 8+      | 10                | 100 (pgBouncer)   |

For 100k+ users, put pgBouncer in front of PostgreSQL to pool
thousands of application connections into a fixed DB pool.
