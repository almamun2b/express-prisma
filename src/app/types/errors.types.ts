import type { TCode } from "./codes.types";

export interface IErrorIssue {
  field?: string | null;
  message: string;
}

export interface IGenericErrorResponse {
  statusCode: number;
  message: string;
  code?: TCode;
  errors: IErrorIssue[];
}

export interface IErrorResponse extends IGenericErrorResponse {
  success: boolean;
  code: TCode;
  timestamp: string;
  path: string;
  error?: {
    name: string;
    message: string;
    rawError?: Error | string;
  };
  stack?: string;
}
