import { env } from "@/app/config/env";
import { redisClient } from "@/app/config/redis";
import { sendEmail } from "@/app/config/smtp.gmail";
import { AppError } from "@/app/utils/appError";
import { Codes } from "@/app/utils/codes";
import {
  getOtpEmailTemplate,
  getPasswordResetEmailTemplate,
} from "@/app/utils/emailTemplate";
import { logger } from "@/app/utils/logger";
import { expiresInToMs, formatSeconds } from "@/app/utils/parser";
import { redis, RedisConstants } from "@/app/utils/redis";
import { extractBearerToken, verifyToken } from "@/app/utils/token";
import type { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthMessages } from "./auth.constants";

const Messages = {
  RESEND_COOLDOWN: (ttl: number) =>
    `Please wait before requesting another code. Try again in ${ttl} second(s).`,
  FAILED_TO_BLACKLIST_ACCESS_TOKEN:
    "Failed to blacklist access token (invalid token):",
  FAILED_TO_BLACKLIST_REFRESH_TOKEN:
    "Failed to blacklist refresh token (invalid token):",
  FAILED_TO_BLACKLIST_RESET_PASS_TOKEN:
    "Failed to blacklist reset password token (invalid token):",
} as const;

const sendOtpToEmail = async (email: string) => {
  const otpKey = redis.getOtpRedisKey(email);
  const cooldownKey = redis.getOtpCooldownRedisKey(email);
  const cooldownExists = await redisClient.exists(cooldownKey);

  if (cooldownExists) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `${Messages.RESEND_COOLDOWN}`,
      Codes.TOO_MANY_REQUESTS,
    );
  }
  const otp = redis.generateOtp();

  await redisClient.setEx(otpKey, RedisConstants.OTP_TTL_SECONDS, otp);
  await redisClient.setEx(
    cooldownKey,
    RedisConstants.OTP_COOLDOWN_SECONDS,
    "1",
  );

  const expiresIn = formatSeconds(RedisConstants.OTP_TTL_SECONDS);
  const html = getOtpEmailTemplate(otp, expiresIn);

  const result = await sendEmail({
    to: email,
    subject: "Your email verification code",
    html,
  });
  return result;
};

const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const expiresInMs = expiresInToMs(env.jwt.resetPassSecretExpiresIn);
  const expiresIn = formatSeconds(Math.floor(expiresInMs / 1000));

  const html = getPasswordResetEmailTemplate(resetLink, expiresIn);

  const result = await sendEmail({
    to: email,
    subject: "Reset your password",
    html,
  });
  return result;
};

const blacklistAccessToken = async (token: string): Promise<void> => {
  try {
    const payload = verifyToken(token, env.jwt.accessTokenSecret);
    const exp = payload.exp;

    if (exp) {
      const ttlSeconds = Math.max(0, exp - Math.floor(Date.now() / 1000));
      if (ttlSeconds > 0) {
        await redisClient.setEx(
          redis.getAccessTokenBlacklistRedisKey(payload),
          ttlSeconds,
          "1",
        );
      }
    }
  } catch (error) {
    logger.info(Messages.FAILED_TO_BLACKLIST_ACCESS_TOKEN, error);
  }
};

const blacklistRefreshToken = async (token: string): Promise<void> => {
  try {
    const payload = verifyToken(token, env.jwt.refreshTokenSecret);
    const exp = payload.exp;

    if (exp) {
      const ttlSeconds = Math.max(0, exp - Math.floor(Date.now() / 1000));
      if (ttlSeconds > 0) {
        await redisClient.setEx(
          redis.getRefreshTokenBlacklistRedisKey(payload),
          ttlSeconds,
          "1",
        );
      }
    }
  } catch (error) {
    logger.info(Messages.FAILED_TO_BLACKLIST_REFRESH_TOKEN, error);
  }
};

const blacklistForgotPassToken = async (token: string): Promise<void> => {
  try {
    const payload = verifyToken(token, env.jwt.resetPassSecret);
    const exp = payload.exp;

    if (exp) {
      const ttlSeconds = Math.max(0, exp - Math.floor(Date.now() / 1000));
      if (ttlSeconds > 0) {
        await redisClient.setEx(
          redis.getForgotPassTokenBlacklistRedisKey(payload),
          ttlSeconds,
          "1",
        );
      }
    }
  } catch (error) {
    logger.info(Messages.FAILED_TO_BLACKLIST_RESET_PASS_TOKEN, error);
  }
};

const blacklistTokens = async (req: Request) => {
  const accessToken: string | undefined =
    extractBearerToken(req.headers.authorization) ?? req.cookies?.accessToken;
  const refreshToken: string | undefined = req.cookies?.refreshToken;

  if (!refreshToken || !accessToken) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.ACCESS_OR_REFRESH_TOKEN_MISSING,
      Codes.UNAUTHORIZED,
    );
  }

  await AuthUtils.blacklistAccessToken(accessToken);
  await AuthUtils.blacklistRefreshToken(refreshToken);
};

export const AuthUtils = {
  sendOtpToEmail,
  blacklistTokens,
  blacklistAccessToken,
  blacklistRefreshToken,
  blacklistForgotPassToken,
  sendPasswordResetEmail,
};
