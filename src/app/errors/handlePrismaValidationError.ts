import { Prisma } from "@/generated/prisma/client";
import { StatusCodes } from "http-status-codes";
import {
  ErrorCode,
  type IErrorIssue,
  type IGenericErrorResponse,
} from "../types/error";

const prismaErrorMessages = {
  VALIDATION_ERROR: "The data provided is invalid or incorrectly formatted.",
  DATABASE_ERROR: "A database error occurred while processing your request.",
};

const handlePrismaValidationError = (
  _err: Prisma.PrismaClientValidationError,
): IGenericErrorResponse => {
  const statusCode = StatusCodes.BAD_REQUEST;
  const message = prismaErrorMessages.VALIDATION_ERROR;
  const code = ErrorCode.VALIDATION_ERROR;
  const errors: IErrorIssue[] = [];

  return {
    statusCode,
    message,
    code,
    errors,
  };
};

export { handlePrismaValidationError };
