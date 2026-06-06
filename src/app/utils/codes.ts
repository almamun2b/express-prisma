import { StatusCodes } from "http-status-codes";
import type { CustomCodesType, HttpStatusCodeMap } from "../types/codes.types";

const CustomCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  FOREIGN_KEY_VIOLATION: "FOREIGN_KEY_VIOLATION",
  APP_ERROR: "APP_ERROR",
  UNIQUE_CONSTRAINT_VIOLATION: "UNIQUE_CONSTRAINT_VIOLATION",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  ENOENT: "ENOENT",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  CLOUDINARY_ERROR: "CLOUDINARY_ERROR",
  INVALID_TOKEN_PAYLOAD: "INVALID_TOKEN_PAYLOAD",
} as const;

const Codes: CustomCodesType & HttpStatusCodeMap = (() => {
  const obj = { ...CustomCodes } as any;
  for (const key of Object.keys(StatusCodes)) {
    if (isNaN(Number(key))) {
      obj[key] = key;
    }
  }
  return obj;
})();

export { Codes, CustomCodes };
