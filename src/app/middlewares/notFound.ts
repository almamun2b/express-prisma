import { AppError } from "@/app/utils/appError";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Codes } from "../utils/codes";

const Messages = {
  NOT_FOUND: "Your requested path is not found!",
} as const;

const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(
    new AppError(StatusCodes.NOT_FOUND, Messages.NOT_FOUND, Codes.NOT_FOUND),
  );
};

export { notFound };
