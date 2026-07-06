import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

const router: Router = Router();

const Messages = {
  SERVER_HEALTHY: 'Server is healthy',
  DATABASE_CONNECTED: 'Database connected successfully',
} as const;

const healthCheck = catchAsync(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: Messages.SERVER_HEALTHY,
    path: req.originalUrl,
    data: {
      uptime: process.uptime(),
      database: Messages.DATABASE_CONNECTED,
    },
  });
});

router.get('/', healthCheck);

export const HealthRoutes = router;
