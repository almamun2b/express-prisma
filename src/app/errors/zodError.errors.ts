import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import type { IErrorIssue, IGenericErrorResponse } from '../types/errors.types';
import { Codes } from '../utils/codes';

const Messages = {
  VALIDATION_ERROR: 'One or more fields in your request are invalid.',
} as const;

const handleZodError = (err: ZodError): IGenericErrorResponse => {
  const errors: IErrorIssue[] = err.issues.map((issue) => {
    return {
      field: issue?.path[issue.path.length - 1]?.toString() ?? '',
      message: issue.message,
    };
  });

  const statusCode = StatusCodes.BAD_REQUEST;

  return {
    statusCode,
    message: Messages.VALIDATION_ERROR,
    code: Codes.VALIDATION_ERROR,
    errors,
  };
};

export { handleZodError };
