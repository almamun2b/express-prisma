import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import {
  ErrorCode,
  type IErrorIssue,
  type IGenericErrorResponse,
} from "../types/error";

const zodErrorMessages = {
  VALIDATION_ERROR: "One or more fields in your request are invalid.",
};

const handleZodError = (err: ZodError): IGenericErrorResponse => {
  const errors: IErrorIssue[] = err.issues.map((issue) => {
    return {
      field: issue?.path[issue.path.length - 1]?.toString() || "",
      message: issue.message,
    };
  });

  const statusCode = StatusCodes.BAD_REQUEST;

  return {
    statusCode,
    message: zodErrorMessages.VALIDATION_ERROR,
    code: ErrorCode.VALIDATION_ERROR,
    errors,
  };
};

export { handleZodError };
