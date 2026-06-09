import { Prisma } from '@/generated/prisma/client';
import type { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { handlePrismaClientKnownRequestError } from '../errors/prismaClientKnownRequestError.errors';
import { handlePrismaValidationError } from '../errors/prismaValidationError.errors';
import { handleZodError } from '../errors/zodError.errors';
import type { TCode } from '../types/codes.types';
import type { IErrorIssue, IErrorResponse } from '../types/errors.types';
import { AppError } from '../utils/appError';
import { Codes } from '../utils/codes';
import { logger } from '../utils/logger';

const isDev = env.nodeEnv === 'development';

const Messages = {
  GENERIC_SERVER_MESSAGE: 'An unexpected error occurred. Please try again later.',
  DATABASE_SERVER_MESSAGE: 'A database error occurred while processing your request.',
  DATABASE_SERVICE_UNAVAILABLE_MESSAGE: 'Database service unavailable',
  DATABASE_ENGINE_FAILURE_MESSAGE: 'Database engine failure',
} as const;

const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  void _next;

  let statusCode: number;
  let message: string;
  let code: TCode;
  let errors: IErrorIssue[];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    code = simplifiedError.code ?? Codes.VALIDATION_ERROR;
    message = simplifiedError.message;
    errors = simplifiedError.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode;
    code = simplifiedError.code ?? Codes.DATABASE_ERROR;
    message = simplifiedError.message;
    errors = simplifiedError.errors;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handlePrismaValidationError(err);
    statusCode = simplifiedError.statusCode;
    code = simplifiedError.code ?? Codes.VALIDATION_ERROR;
    message = simplifiedError.message;
    errors = simplifiedError.errors;
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    code = Codes.DATABASE_ERROR;
    message = Messages.DATABASE_SERVER_MESSAGE;
    errors = [];
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    code = Codes.DATABASE_ERROR;
    message = Messages.DATABASE_SERVICE_UNAVAILABLE_MESSAGE;
    errors = [];
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    code = Codes.DATABASE_ERROR;
    message = Messages.DATABASE_ENGINE_FAILURE_MESSAGE;
    errors = [];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err?.code ?? Codes.APP_ERROR;
    message = err.message;
    errors = [];
  } else if (err instanceof Error) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    code = Codes.INTERNAL_SERVER_ERROR;
    message = err.message;
    errors = [];
  } else {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    code = Codes.UNKNOWN_ERROR;
    message = Messages.GENERIC_SERVER_MESSAGE;
    errors = [];
  }

  if (statusCode >= Number(StatusCodes.INTERNAL_SERVER_ERROR)) {
    logger.error(message, err, {
      statusCode,
      code,
      path: req.originalUrl,
      ip: req.ip,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });
  }

  const errorBody: IErrorResponse = {
    success: false,
    statusCode,
    code,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    errors,
  };

  if (isDev) {
    if (err instanceof Error) {
      errorBody.error = { name: err?.name ?? 'UnknownError', message };
      errorBody.stack = err?.stack;
    }
  }

  res.status(statusCode).json(errorBody);
};

export default globalErrorHandler;
