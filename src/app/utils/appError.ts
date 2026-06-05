import type { TCode } from "../types/codes.types";

const Messages = {
  SOMETHING_WENT_WRONG: "Something went wrong!",
} as const;

class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: TCode;
  public readonly isOperational?: boolean;

  constructor(
    statusCode: number,
    message: string = Messages.SOMETHING_WENT_WRONG,
    code?: TCode,
    isOperational: boolean = true,
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
