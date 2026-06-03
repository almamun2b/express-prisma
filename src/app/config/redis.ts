import { createClient } from "redis";
import { logger } from "../utils/logger";
import { env } from "./env";

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_RECONNECT_DELAY = 30000;

const redisClient: ReturnType<typeof createClient> = createClient({
  username: env.redis.username,
  password: env.redis.password,

  socket: {
    host: env.redis.host,
    port: env.redis.port,

    reconnectStrategy: (retries: number) => {
      if (retries >= MAX_RECONNECT_ATTEMPTS) {
        logger.error(
          `Redis reconnect limit reached (${MAX_RECONNECT_ATTEMPTS} attempts).`,
        );

        return false;
      }

      const delay = Math.min(1000 * Math.pow(2, retries), MAX_RECONNECT_DELAY);

      logger.warn(
        `Redis reconnect attempt #${retries + 1}. Retrying in ${delay}ms`,
      );

      return delay;
    },
  },
});

redisClient.on("reconnecting", () => {
  logger.warn("Redis: reconnecting...");
});

redisClient.on("end", () => {
  logger.warn("Redis: connection closed");
});

redisClient.on("error", (error: Error) => {
  logger.error("Redis error:", error);
});

const connectRedis = async () => {
  try {
    if (redisClient.isReady) {
      logger.info("Redis already connected");
      return;
    }

    await redisClient.connect();

    logger.info("Successfully connected to Redis");
  } catch (error) {
    logger.error("Failed to connect Redis:", error);

    throw error;
  }
};

export { connectRedis, redisClient };
