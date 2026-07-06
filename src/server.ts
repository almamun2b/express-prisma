import app from './app';
import { prisma } from './app/config/prisma';
import { connectRedis } from './app/config/redis';
import { logger } from './app/utils/logger';

// Connect to services (Prisma + Redis) when function initializes
const initializeServices = async () => {
  try {
    await prisma.$connect();
    logger.info('Successfully connected to PostgreSQL database');

    await connectRedis();
    logger.info('Successfully connected to Redis');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw error;
  }
};

// Initialize services on cold start
void initializeServices();

// Export the Express app (required by Vercel)
export default app;

// Optional: Handle unhandled errors (good practice in serverless)
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception:', error);
});
