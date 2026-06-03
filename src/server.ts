import app from "@/app";
import { env } from "@/app/config/env";
import { prisma } from "@/app/config/prisma";
import { logger } from "@/app/utils/logger";
import type { Server } from "http";
import { connectRedis } from "./app/config/redis";

let server: Server;
let isShuttingDown = false;

const shutdown = async (signal: string, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info("HTTP server closed");
    }

    await prisma.$disconnect();
    logger.info("Database connection closed");
    logger.info("Shutdown complete");

    process.exit(exitCode);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

const bootstrap = async () => {
  try {
    await prisma.$connect();
    logger.info("Successfully connected to PostgreSQL database");

    server = app.listen(env.port, () => {
      logger.info(`Server is running at http://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectRedis();
  await bootstrap();
};

startServer();

process.on("unhandledRejection", (error: Error) => {
  logger.error("Unhandled rejection detected! Server is shutting down:", error);
  void shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught exception detected! Server is shutting down:", error);
  void shutdown("uncaughtException", 1);
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM", 0);
});

process.on("SIGINT", () => {
  void shutdown("SIGINT", 0);
});
