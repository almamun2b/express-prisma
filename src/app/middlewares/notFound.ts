import { ErrorCode } from "@/app/types/error";
import { AppError } from "@/app/utils/AppError";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(
    new AppError(
      StatusCodes.NOT_FOUND,
      "Your requested path is not found!",
      true,
      ErrorCode.NOT_FOUND,
    ),
  );
};

export { notFound };

// const notFound = (req: Request, res: Response, next: NextFunction) => {
//   res.status(StatusCodes.NOT_FOUND).json({
//     success: false,
//     message: "Your requested path is not found!",
//     code: "NOT_FOUND",
//     statusCode: StatusCodes.NOT_FOUND,
//     timestamp: new Date().toISOString(),
//     path: req.originalUrl,
//   });
//   next();
// };
