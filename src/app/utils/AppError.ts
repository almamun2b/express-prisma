import type { ErrorCode } from "../types/error";

class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: ErrorCode;

  constructor(
    statusCode: number,
    message: string = "Something went wrong!",
    isOperational = true,
    code?: ErrorCode,
    stack?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (code !== undefined) {
      this.code = code;
    }
    this.name = this.constructor.name;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { AppError };
