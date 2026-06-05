import { Prisma } from "@/generated/prisma/client";
import { StatusCodes } from "http-status-codes";
import type { IErrorIssue, IGenericErrorResponse } from "../types/errors";
import { Codes } from "../utils/codes";

const Messages = {
  VALIDATION_ERROR: "The data provided is invalid or incorrectly formatted.",
  DATABASE_ERROR: "A database error occurred while processing your request.",
} as const;

const handlePrismaValidationError = (
  _err: Prisma.PrismaClientValidationError,
): IGenericErrorResponse => {
  const statusCode = StatusCodes.BAD_REQUEST;
  const message = Messages.VALIDATION_ERROR;
  const code = Codes.VALIDATION_ERROR;
  const errors: IErrorIssue[] = [];

  return {
    statusCode,
    message,
    code,
    errors,
  };
};

export { handlePrismaValidationError };
