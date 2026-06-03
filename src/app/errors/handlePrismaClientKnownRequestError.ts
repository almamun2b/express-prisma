import { Prisma } from "@/generated/prisma/client";
import { StatusCodes } from "http-status-codes";
import {
  ErrorCode,
  type IErrorIssue,
  type IGenericErrorResponse,
} from "../types/error";

const PRISMA_UNAVAILABLE_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1008",
  "P1010",
  "P1011",
  "P1017",
]);

const prismaErrorMessages = {
  DUPLICATE_ENTRY: "The record you are trying to create already exists.",
  RECORD_NOT_FOUND: "The requested record could not be found.",
  FOREIGN_KEY_VIOLATION: "The related record does not exist",
  DATABASE_SERVICE_UNAVAILABLE: "Database service is temporarily unavailable.",
  DATABASE_ERROR: "A database error occurred while processing your request.",
  UNKNOWN_ERROR: "An unknown database error occurred.",
  UNIQUE_CONSTRAINT_VIOLATION: "This value already exists",
  DATABASE_ENGINE_FAILURE: "Database engine failure",
};

const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): IGenericErrorResponse => {
  let statusCode = StatusCodes.BAD_REQUEST;
  let message = prismaErrorMessages.DATABASE_ERROR;
  let code: ErrorCode = ErrorCode.DATABASE_ERROR;
  let errors: IErrorIssue[] = [];

  if (err.code === "P2002") {
    statusCode = StatusCodes.CONFLICT;
    code = ErrorCode.DUPLICATE_ENTRY;
    message = prismaErrorMessages.DUPLICATE_ENTRY;
    errors = [
      {
        field: Array.isArray(err.meta?.target)
          ? err.meta.target.join(", ")
          : (err.meta?.target as string) || "",
        message: prismaErrorMessages.UNIQUE_CONSTRAINT_VIOLATION,
      },
    ];
  } else if (err.code === "P2025") {
    statusCode = StatusCodes.NOT_FOUND;
    message = prismaErrorMessages.RECORD_NOT_FOUND;
    code = ErrorCode.RECORD_NOT_FOUND;
    errors = [
      {
        field: "",
        message:
          (err.meta?.cause as string) || prismaErrorMessages.RECORD_NOT_FOUND,
      },
    ];
  } else if (err.code === "P2003") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = prismaErrorMessages.FOREIGN_KEY_VIOLATION;
    code = ErrorCode.FOREIGN_KEY_VIOLATION;
    errors = [
      {
        field: (err.meta?.field_name as string) || "",
        message: prismaErrorMessages.FOREIGN_KEY_VIOLATION,
      },
    ];
  } else if (PRISMA_UNAVAILABLE_CODES.has(err.code)) {
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    message = prismaErrorMessages.DATABASE_SERVICE_UNAVAILABLE;
    code = ErrorCode.DATABASE_ERROR;
    errors = [];
  } else {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message = prismaErrorMessages.DATABASE_ERROR;
    code = ErrorCode.DATABASE_ERROR;
    errors = [];
  }

  return {
    statusCode,
    message,
    code,
    errors,
  };
};

export { handlePrismaError };
