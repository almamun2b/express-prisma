import { inspect } from "util";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize, json, errors, splat, ms } =
  winston.format;

const MASK_VALUE = "********";
const JWT_REGEX = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

const normalizeKey = (key: string): string =>
  key.replace(/[-_\s]/g, "").toLowerCase();

const SENSITIVE_KEYS = new Set<string>(
  [
    "password",
    "pass",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "apiKey",
    "apiSecret",
    "secret",
    "creditCard",
    "cardNumber",
    "cookie",
    "setCookie",
  ].map(normalizeKey),
);

const isDev = env.nodeEnv === "development";

const isSensitiveKey = (key: string): boolean =>
  SENSITIVE_KEYS.has(normalizeKey(key));

const maskString = (value: string): string => {
  return value.replace(JWT_REGEX, MASK_VALUE);
};

const maskError = (error: Error): Record<string, unknown> => ({
  name: error.name,
  message: maskString(error.message),
  ...(error.stack !== undefined && { stack: maskString(error.stack) }),
});

const maskRecord = (
  record: Record<string, unknown>,
  seen: WeakSet<object>,
): Record<string, unknown> => {
  const masked: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(record)) {
    masked[key] = maskValue(val, key, seen);
  }
  return masked;
};

const maskValue = (
  value: unknown,
  key: string,
  seen: WeakSet<object>,
): unknown => {
  if (isSensitiveKey(key)) {
    return MASK_VALUE;
  }

  if (typeof value === "string") {
    return maskString(value);
  }

  if (value instanceof Error) {
    return maskError(value);
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);
    return value.map((item) => maskValue(item, key, seen));
  }

  if (value !== null && typeof value === "object") {
    if (Buffer.isBuffer(value)) {
      return `[Buffer ${value.length} bytes]`;
    }
    if (value instanceof Date) {
      return value;
    }
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);
    return maskRecord(value as Record<string, unknown>, seen);
  }

  return value;
};

const maskFormat = winston.format(
  (
    info: winston.Logform.TransformableInfo,
  ): winston.Logform.TransformableInfo => {
    const seen = new WeakSet<object>();
    const mutable = info as Record<string, unknown>;
    for (const key of Object.keys(mutable)) {
      if (key === "level" || key === "splat") {
        continue;
      }
      mutable[key] = maskValue(mutable[key], key, seen);
    }
    return info;
  },
);

const safeStringify = (obj: unknown): string => {
  try {
    return JSON.stringify(obj);
  } catch {
    return inspect(obj, { depth: 3, colors: false });
  }
};

const baseFormat = combine(
  errors({ stack: true }),
  splat(),
  maskFormat(),
  ms(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
);

const consoleFormat = combine(
  colorize({ all: true }),
  printf(({ level, message, timestamp, stack, ms, ...metadata }) => {
    let metaString = "";

    const cleanedMeta = { ...metadata };
    delete cleanedMeta.splat;

    if (Object.keys(cleanedMeta).length > 0) {
      metaString = ` ${safeStringify(cleanedMeta)}`;
    }

    const msString = ms ? ` ${ms}` : "";
    const stackTrace = stack ? `\n${stack}` : "";

    return `${timestamp}${msString} [${level}]: ${message}${metaString}${stackTrace}`;
  }),
);

const fileFormat = json();

const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  format: baseFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
      format: consoleFormat,
    }),

    new DailyRotateFile({
      dirname: "logs",
      filename: "application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "info",
      format: fileFormat,
    }),

    new DailyRotateFile({
      dirname: "logs",
      filename: "errors-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

export { logger };
