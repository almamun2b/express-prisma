import { env } from "@/app/config/env";
import { redisClient } from "@/app/config/redis";
import { sendEmail } from "@/app/config/smtp.gmail";
import { AppError } from "@/app/utils/AppError";
import { verifyToken } from "@/app/utils/jwt";
import { logger } from "@/app/utils/logger";
import { expiresInToMs, formatSeconds } from "@/app/utils/parser";
import { createHash, randomInt } from "crypto";
import type { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthConstants, AuthMessages } from "./auth.constants";

const generateOtp = (): string => {
  let otp = "";
  for (let i = 0; i < AuthConstants.OTP_LENGTH; i++) {
    otp += randomInt(0, 10).toString();
  }
  return otp;
};

const otpRedisKey = (email: string): string =>
  `${AuthConstants.OTP_TLT_KEY_PREFIX}${email}`;

const otpCooldownRedisKey = (email: string): string =>
  `${AuthConstants.OTP_COOLDOWN_KEY_PREFIX}${email}`;

const accessTokenBlacklistRedisKey = (token: string): string => {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return `${AuthConstants.ACCESS_TOKEN_BLACKLIST_PREFIX}${tokenHash}`;
};

const refreshTokenBlacklistRedisKey = (token: string): string => {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return `${AuthConstants.REFRESH_TOKEN_BLACKLIST_PREFIX}${tokenHash}`;
};

const forgotPassCooldownRedisKey = (email: string): string =>
  `${AuthConstants.FORGOT_PASS_COOLDOWN_KEY_PREFIX}${email}`;

const forgotPassTokenBlacklistRedisKey = (token: string): string => {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return `${AuthConstants.FORGOT_PASS_TOKEN_BLACKLIST_PREFIX}${tokenHash}`;
};

const sendOtpToEmail = async (email: string) => {
  const otpKey = otpRedisKey(email);
  const cooldownKey = AuthUtils.otpCooldownRedisKey(email);
  const cooldownExists = await redisClient.exists(cooldownKey);

  if (cooldownExists) {
    const ttl = await redisClient.ttl(cooldownKey);
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `${AuthMessages.RESEND_COOLDOWN} Try again in ${ttl} second(s).`,
    );
  }
  const otp = generateOtp();

  await redisClient.setEx(otpKey, AuthConstants.OTP_TTL_SECONDS, otp);
  await redisClient.setEx(cooldownKey, AuthConstants.OTP_COOLDOWN_SECONDS, "1");

  const expiresIn = formatSeconds(AuthConstants.OTP_TTL_SECONDS);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #333333; text-align: center; margin-bottom: 24px;">Verification Code</h2>
      <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        You recently requested a verification code for <strong>email verification</strong>. Please use the following code to proceed:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; padding: 16px 32px; background-color: #f4f4f5; color: #18181b; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 6px;">
          ${otp}
        </span>
      </div>
      <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        This code will expire in <strong>${expiresIn}</strong>. If you did not request this, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eaeaec; margin: 32px 0;" />
      <p style="color: #888888; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply.
      </p>
    </div>
  `;
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

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #333333; text-align: center; margin-bottom: 24px;">Reset Your Password</h2>
      <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        We received a request to reset the password for your account. Click the button below to create a new password.
        This link will expire in <strong>${expiresIn}</strong>.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}"
           style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
      </div>
      <p style="color: #555555; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
      </p>
      <p style="color: #888888; font-size: 13px; line-height: 1.5;">
        If you did not request a password reset, please ignore this email. Your password will remain unchanged.
      </p>
      <hr style="border: none; border-top: 1px solid #eaeaec; margin: 32px 0;" />
      <p style="color: #888888; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply.
      </p>
    </div>
  `;

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
          accessTokenBlacklistRedisKey(token),
          ttlSeconds,
          "1",
        );
      }
    }
  } catch (error) {
    logger.info("Failed to blacklist access token (invalid token):", error);
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
          refreshTokenBlacklistRedisKey(token),
          ttlSeconds,
          "1",
        );
      }
    }
  } catch (error) {
    logger.info("Failed to blacklist refresh token (invalid token):", error);
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
          forgotPassTokenBlacklistRedisKey(token),
          ttlSeconds,
          "1",
        );
      }
    }
  } catch (error) {
    logger.info("Failed to blacklist reset password token (invalid token):", error);
  }
};

const blacklistTokens = async (req: Request) => {
  const accessToken: string | undefined = req.cookies?.accessToken;
  const refreshToken: string | undefined = req.cookies?.refreshToken;

  console.log(accessToken, refreshToken, "Mamun");

  if (!refreshToken || !accessToken) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.ACCESS_OR_REFRESH_TOKEN_MISSING,
    );
  }

  await AuthUtils.blacklistAccessToken(accessToken);
  await AuthUtils.blacklistRefreshToken(refreshToken);
};

export const AuthUtils = {
  generateOtp,
  otpRedisKey,
  sendOtpToEmail,
  blacklistTokens,
  otpCooldownRedisKey,
  blacklistAccessToken,
  blacklistRefreshToken,
  blacklistForgotPassToken,
  sendPasswordResetEmail,
  forgotPassCooldownRedisKey,
  accessTokenBlacklistRedisKey,
  refreshTokenBlacklistRedisKey,
  forgotPassTokenBlacklistRedisKey,
};
