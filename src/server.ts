import app from '@/app';
import { env } from '@/app/config/env';
import { prisma } from '@/app/config/prisma';
import { logger } from '@/app/utils/logger';
import type { Server } from 'http';
import { connectRedis } from './app/config/redis';

let server: Server;
let isShuttingDown = false;

const Messages = {
  SHUTTING_DOWN_GRACEFULLY: (signal: string) => `${signal} received. Shutting down gracefully...`,
  SERVER_START_SUCCESS: (port: number) => `Server is running at: http://localhost:${port}`,
  SERVER_CLOSE: 'HTTP server closed',
  DATABASE_CONNECTION_CLOSE: 'Database connection closed',
  SHUTDOWN_COMPLETE: 'Shutdown complete',
  ERROR_DURING_SHUTDOWN: 'Error during graceful shutdown:',
  CONNECTED_TO_POSTGRESQL_DB: 'Successfully connected to PostgreSQL database',
  FAILED_TO_START_SERVER: 'Failed to start server:',
  UNHANDLED_REJECTION_DETECTED: 'Unhandled rejection detected! Server is shutting down:',
  UNCAUGHT_EXCEPTION_DETECTED: 'Uncaught exception detected! Server is shutting down:',
} as const;

const shutdown = async (signal: string, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(Messages.SHUTTING_DOWN_GRACEFULLY(signal));

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info(Messages.SERVER_CLOSE);
    }

    await prisma.$disconnect();
    logger.info(Messages.DATABASE_CONNECTION_CLOSE);
    logger.info(Messages.SHUTDOWN_COMPLETE);

    process.exit(exitCode);
  } catch (error) {
    logger.error(Messages.ERROR_DURING_SHUTDOWN, error);
    process.exit(1);
  }
};

const bootstrap = async () => {
  try {
    await prisma.$connect();
    logger.info(Messages.CONNECTED_TO_POSTGRESQL_DB);

    server = app.listen(env.port, () => {
      logger.info(Messages.SERVER_START_SUCCESS(env.port));
    });
  } catch (error) {
    logger.error(Messages.FAILED_TO_START_SERVER, error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectRedis();
  await bootstrap();
};

if (!process.env['VERCEL']) {
  void startServer();
}

process.on('unhandledRejection', (error: Error) => {
  logger.error(Messages.UNHANDLED_REJECTION_DETECTED, error);
  void shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error(Messages.UNCAUGHT_EXCEPTION_DETECTED, error);
  void shutdown('uncaughtException', 1);
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM', 0);
});

process.on('SIGINT', () => {
  void shutdown('SIGINT', 0);
});

// Vercel serverless handler
export default app;
