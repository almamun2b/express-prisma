import { UserStatus } from "@/generated/prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

interface UserStatusData {
  status: UserStatus;
  isVerified: boolean;
}
/**
 * Validates a user's account status and verification state.
 * Throws a custom \`AppError\` if the user is null, unverified, or has a restricted status.
 *
 * As an assertion function, it also narrows the TypeScript type of the \`user\`
 * parameter to guarantee it is not \`null\` in subsequent code.
 *
 * @template T - The user object type, which must include \`status\` and \`isVerified\`.
 * @param {T | null} user - The user record to check, usually retrieved from the database.
 * @throws {AppError} Throws \`401 Unauthorized\` if the user is null.
 * @throws {AppError} Throws \`403 Forbidden\` if the user is pending, unverified, inactive, suspended, banned, or deleted.
 */

export function checkUserStatus<T extends UserStatusData>(
  user: T | null | undefined,
): asserts user is T {
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User does not exist");
  }

  if (user.status === UserStatus.PENDING || !user.isVerified) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Your account is pending. Please verify your email.",
    );
  } else if (user.status === UserStatus.INACTIVE) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Your account has been deactivated.",
    );
  } else if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Your account has been suspended, please contact admin.",
    );
  } else if (user.status === UserStatus.BANNED) {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account has been banned.");
  } else if (user.status === UserStatus.DELETED) {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account has been deleted.");
  }
}
