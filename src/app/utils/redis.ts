import { randomInt } from "crypto";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { AppError } from "./appError";
import { Codes } from "./codes";

const Messages = {
  INVALID_TOKEN_PAYLOAD: "Invalid token payload",
} as const;

const RedisConstants = {
  OTP_LENGTH: 6,
  OTP_TTL_SECONDS: 10 * 60,
  OTP_COOLDOWN_SECONDS: 2 * 60,
  OTP_TLT_KEY_PREFIX: "otp:",
  OTP_COOLDOWN_KEY_PREFIX: "otp:cooldown:",

  ACCESS_TOKEN_BLACKLIST_PREFIX: "blacklist:at:",
  REFRESH_TOKEN_BLACKLIST_PREFIX: "blacklist:rt:",
  FORGOT_PASS_TOKEN_BLACKLIST_PREFIX: "blacklist:fp:",

  FORGOT_PASS_COOLDOWN_SECONDS: 2 * 60,
  FORGOT_PASS_COOLDOWN_KEY_PREFIX: "fp:cooldown:",
} as const;

const generateOtp = (): string => {
  let otp = "";
  for (let i = 0; i < RedisConstants.OTP_LENGTH; i++) {
    otp += randomInt(0, 10).toString();
  }
  return otp;
};

const getOtpRedisKey = (email: string): string => {
  return `${RedisConstants.OTP_TLT_KEY_PREFIX}${email}`;
};

const getOtpCooldownRedisKey = (email: string): string => {
  return `${RedisConstants.OTP_COOLDOWN_KEY_PREFIX}${email}`;
};

const getAccessTokenBlacklistRedisKey = (payload: JwtPayload): string => {
  const jti = payload.jti;

  if (!jti) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      Messages.INVALID_TOKEN_PAYLOAD,
      Codes.UNAUTHORIZED,
    );
  }
  return `${RedisConstants.ACCESS_TOKEN_BLACKLIST_PREFIX}${jti}`;
};

const getRefreshTokenBlacklistRedisKey = (payload: JwtPayload): string => {
  const jti = payload.jti;

  if (!jti) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      Messages.INVALID_TOKEN_PAYLOAD,
      Codes.UNAUTHORIZED,
    );
  }
  return `${RedisConstants.REFRESH_TOKEN_BLACKLIST_PREFIX}${jti}`;
};

const getForgotPassCooldownRedisKey = (email: string): string => {
  return `${RedisConstants.FORGOT_PASS_COOLDOWN_KEY_PREFIX}${email}`;
};

const getForgotPassTokenBlacklistRedisKey = (payload: JwtPayload): string => {
  const jti = payload.jti;

  if (!jti) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      Messages.INVALID_TOKEN_PAYLOAD,
      Codes.UNAUTHORIZED,
    );
  }
  return `${RedisConstants.FORGOT_PASS_TOKEN_BLACKLIST_PREFIX}${jti}`;
};

const redis = {
  generateOtp,
  getOtpRedisKey,
  getOtpCooldownRedisKey,
  getAccessTokenBlacklistRedisKey,
  getRefreshTokenBlacklistRedisKey,
  getForgotPassCooldownRedisKey,
  getForgotPassTokenBlacklistRedisKey,
};

export { redis, RedisConstants };
