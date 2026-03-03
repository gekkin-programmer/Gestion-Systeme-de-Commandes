import type { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { logger } from '../config/logger';

/**
 * Express middleware that caches GET responses in Redis.
 * Serves stale-while-revalidate: returns cached value instantly,
 * skips caching if Redis is unavailable (fail-open).
 *
 * @param ttl  Cache TTL in seconds (default: 60)
 * @param keyFn  Custom key builder; defaults to req.originalUrl
 */
export function cacheResponse(ttl = 60, keyFn?: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') { next(); return; }

    const cacheKey = `cache:${keyFn ? keyFn(req) : req.originalUrl}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', `public, max-age=${ttl}`);
        res.json(JSON.parse(cached));
        return;
      }
    } catch (err) {
      // Redis unavailable — continue to serve fresh from DB
      logger.warn({ err, key: cacheKey }, 'Cache read failed, serving fresh');
    }

    // Intercept res.json to write the response into cache
    const originalJson = res.json.bind(res);
    res.json = (body): Response => {
      if (res.statusCode === 200) {
        redis
          .setex(cacheKey, ttl, JSON.stringify(body))
          .catch((err) => logger.warn({ err, key: cacheKey }, 'Cache write failed'));
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', `public, max-age=${ttl}`);
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Delete all cache keys matching a glob pattern.
 * Uses SCAN instead of KEYS to avoid blocking Redis.
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const fullPattern = `cache:${pattern}`;
  let cursor = '0';
  const keys: string[] = [];

  do {
    const [nextCursor, found] = await redis.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
    cursor = nextCursor;
    keys.push(...found);
  } while (cursor !== '0');

  if (keys.length > 0) {
    await redis.del(...keys);
    logger.debug({ count: keys.length, pattern: fullPattern }, 'Cache invalidated');
  }
}
