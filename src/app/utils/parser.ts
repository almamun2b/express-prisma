import { StatusCodes } from "http-status-codes";
import type { TJwtExpiresIn } from "../types/jwt";
import { AppError } from "./appError";
import { Codes } from "./codes";

const Messages = {
  INVALID_EXPIRES_IN_FORMAT: (value: string) =>
    `Invalid expiresIn format: ${value}`,
} as const;

/**
 * Converts a JWT `expiresIn` value into milliseconds.
 *
 * The input must match the `TJwtExpiresIn` type, which supports:
 * - `${number}ms` → milliseconds
 * - `${number}s`  → seconds
 * - `${number}m`  → minutes
 * - `${number}h`  → hours
 * - `${number}d`  → days
 * - `${number}w`  → weeks
 * - `${number}y`  → years (approx. 365 days)
 */
const expiresInToMs = (value: TJwtExpiresIn): number => {
  const regex = /^(\d+(?:\.\d+)?)(?:\s*)(ms|s|m|h|d|w|y)?$/i;
  const match = value.match(regex);

  if (!match || !match[1]) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      Messages.INVALID_EXPIRES_IN_FORMAT(value),
      Codes.BAD_REQUEST,
    );
  }

  const num = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase();

  switch (unit) {
    case "ms":
      return num;
    case "s":
      return num * 1000;
    case "m":
      return num * 60 * 1000;
    case "h":
      return num * 60 * 60 * 1000;
    case "d":
      return num * 24 * 60 * 60 * 1000;
    case "w":
      return num * 7 * 24 * 60 * 60 * 1000;
    case "y":
      return num * 365 * 24 * 60 * 60 * 1000;
    default:
      return num;
  }
};

/**
 * Converts a duration in seconds to a human-readable string format.
 * The function will choose the largest appropriate time unit (seconds, minutes, hours, days, or years)
 * and format the output accordingly.
 *
 * For example:
 * - `formatSeconds(45)` → "45 seconds"
 * - `formatSeconds(120)` → "2 minutes"
 **/

const formatSeconds = (seconds: number): string => {
  if (seconds <= 0) return "0 seconds";
  const units = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
    [1, "second"],
  ] as const;

  for (const [unitSeconds, label] of units) {
    if (seconds >= unitSeconds) {
      const value = Math.floor(seconds / unitSeconds);
      return `${value} ${label}${value > 1 ? "s" : ""}`;
    }
  }

  return `${seconds} seconds`;
};

export { expiresInToMs, formatSeconds };
