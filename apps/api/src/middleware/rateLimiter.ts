import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis';

// Shared Redis store — all rate limit counters are distributed across every
// process/instance so limits hold even when running in PM2 cluster mode.
function makeStore(prefix: string) {
  return new RedisStore({
    prefix: `rl:${prefix}:`,
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as any,
  });
}

// 200 requests / 15 min — general traffic
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('global'),
  message: { success: false, error: 'Too many requests, please try again later' },
});

// 10 login attempts / 15 min — brute-force protection
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('auth'),
  message: { success: false, error: 'Too many auth attempts, please try again later' },
});

// 20 orders / 10 min — anti-spam
export const orderRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('order'),
  message: { success: false, error: 'Too many orders submitted, please wait a moment' },
});

// 10 payment attempts / 15 min
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('payment'),
  message: { success: false, error: 'Too many payment attempts, please try again later' },
});

// 60 requests / 15 min — admin mutation endpoints
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('admin'),
  message: { success: false, error: 'Too many admin requests, please slow down' },
});
