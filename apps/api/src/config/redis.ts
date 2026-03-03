import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

function createRedisClient(name: string): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) return null; // Stop retrying after 10 attempts
      return Math.min(times * 200, 5000);
    },
    enableReadyCheck: true,
    lazyConnect: false,
  });

  client.on('connect',   () => logger.info(`[Redis:${name}] Connected`));
  client.on('ready',     () => logger.info(`[Redis:${name}] Ready`));
  client.on('error',     (err) => logger.error({ err }, `[Redis:${name}] Error`));
  client.on('close',     () => logger.warn(`[Redis:${name}] Connection closed`));

  return client;
}

// Primary client — used for pub, cache, rate limiting
export const redis = createRedisClient('primary');

// Duplicate for Socket.io sub channel (ioredis requires separate connections for pub/sub)
export const redisSub = createRedisClient('sub');
