export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  RECORD_NOT_FOUND = "RECORD_NOT_FOUND",
  FOREIGN_KEY_VIOLATION = "FOREIGN_KEY_VIOLATION",
  APP_ERROR = "APP_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  BAD_REQUEST = "BAD_REQUEST",
  CONFLICT = "CONFLICT",
  UNIQUE_CONSTRAINT_VIOLATION = "UNIQUE_CONSTRAINT_VIOLATION",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  ENOENT = "ENOENT",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface IErrorIssue {
  field?: string | null;
  message: string;
}

export interface IGenericErrorResponse {
  statusCode: number;
  message: string;
  code?: ErrorCode;
  errors: IErrorIssue[];
}

export interface IErrorResponse extends IGenericErrorResponse {
  success: boolean;
  code: ErrorCode;
  timestamp: string;
  path: string;
  error?: {
    name: string;
    message: string;
    rawError?: Error | string;
  };
  stack?: string;
}
