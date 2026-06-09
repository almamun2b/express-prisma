import { env } from '@/app/config/env';
import rateLimit from 'express-rate-limit';

const maxRequests = env.nodeEnv === 'development' ? 10000 : 1000; // Limit each IP to 1000 requests per windowMs
const maxAuthRequests = env.nodeEnv === 'development' ? 1000 : 5; // Limit each IP to 5 requests per windowMs
const windowMs = 15 * 60 * 1000; // 15 minutes

const Messages = {
  TOO_MANY_REQUESTS: 'Too many requests from this IP, please try again later.',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many login attempts, please try again later.',
} as const;

export const apiLimiter = rateLimit({
  windowMs: windowMs,
  max: maxRequests,
  message: Messages.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: windowMs,
  max: maxAuthRequests,
  message: Messages.TOO_MANY_LOGIN_ATTEMPTS,
  skipSuccessfulRequests: true,
});
