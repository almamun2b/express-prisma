import { createClient } from "redis";
import { logger } from "../utils/logger";
import { env } from "./env";

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_RECONNECT_DELAY = 30000;

const Messages = {
  REDIS_RECONNECT_LIMIT_REACHED: (maxAttempts: number) =>
    `Redis reconnect limit reached (${maxAttempts} attempts).`,
  REDIS_RECONNECTING_ATTEMPT: (retries: number, delay: number) =>
    `Redis reconnect attempt #${retries}. Retrying in ${delay}ms`,
  REDIS_RECONNECTING: "Redis: reconnecting...",
  REDIS_CONNECTION_CLOSED: "Redis: connection closed",
  REDIS_ERROR: "Redis error:",
  REDIS_ALREADY_CONNECTED: "Redis already connected",
  REDIS_FAILED_TO_CONNECT: "Failed to connect Redis:",
  REDIS_CONNECTED: "Successfully connected to Redis",
} as const;

const redisClient: ReturnType<typeof createClient> = createClient({
  username: env.redis.username,
  password: env.redis.password,

  socket: {
    host: env.redis.host,
    port: env.redis.port,

    reconnectStrategy: (retries: number) => {
      if (retries >= MAX_RECONNECT_ATTEMPTS) {
        logger.error(
          Messages.REDIS_RECONNECT_LIMIT_REACHED(MAX_RECONNECT_ATTEMPTS),
        );

        return false;
      }

      const delay = Math.min(1000 * Math.pow(2, retries), MAX_RECONNECT_DELAY);

      logger.warn(Messages.REDIS_RECONNECTING_ATTEMPT(retries + 1, delay));

      return delay;
    },
  },
});

redisClient.on("reconnecting", () => {
  logger.warn(Messages.REDIS_RECONNECTING);
});

redisClient.on("end", () => {
  logger.warn(Messages.REDIS_CONNECTION_CLOSED);
});

redisClient.on("error", (error: Error) => {
  logger.error(Messages.REDIS_ERROR, error);
});

const connectRedis = async () => {
  try {
    if (redisClient.isReady) {
      logger.info(Messages.REDIS_ALREADY_CONNECTED);
      return;
    }

    await redisClient.connect();

    logger.info(Messages.REDIS_CONNECTED);
  } catch (error) {
    logger.error(Messages.REDIS_FAILED_TO_CONNECT, error);

    throw error;
  }
};

export { connectRedis, redisClient };
