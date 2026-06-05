import { env } from "@/app/config/env";
import { prisma } from "@/app/config/prisma";
import { catchAsync } from "@/app/utils/catchAsync";
import { sendResponse } from "@/app/utils/sendResponse";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/appError";

const router: Router = Router();

const Messages = {
  SERVER_HEALTHY: "Server is healthy",
  DATABASE_CONNECTED: "Database connected successfully",
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

router.get("/", healthCheck);

if (env.nodeEnv === "development") {
  router.get("/trigger-500", () => {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Artificial server error for testing",
    );
  });
}

export const HealthRoutes = router;
