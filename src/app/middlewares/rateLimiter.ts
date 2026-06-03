import { env } from "@/app/config/env";
import rateLimit from "express-rate-limit";

const maxRequests = env.nodeEnv === "development" ? 10000 : 1000; // Limit each IP to 1000 requests per windowMs
const maxAuthRequests = env.nodeEnv === "development" ? 1000 : 5; // Limit each IP to 5 requests per windowMs
const windowMs = 15 * 60 * 1000; // 15 minutes
const requestMessage =
  "Too many requests from this IP, please try again later.";
const authMessage = "Too many login attempts, please try again later.";

export const apiLimiter = rateLimit({
  windowMs: windowMs,
  max: maxRequests,
  message: requestMessage,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: windowMs,
  max: maxAuthRequests,
  message: authMessage,
  skipSuccessfulRequests: true,
});
