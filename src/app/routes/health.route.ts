import { env } from "@/app/config/env";
import { prisma } from "@/app/config/prisma";
import { catchAsync } from "@/app/utils/catchAsync";
import { sendResponse } from "@/app/utils/sendResponse";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/AppError";

const router: Router = Router();

const healthCheck = catchAsync(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Server is healthy",
    path: req.originalUrl,
    data: {
      uptime: process.uptime(),
      database: "connected",
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
