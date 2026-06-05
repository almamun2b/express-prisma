import { env } from "@/app/config/env";
import { prisma } from "@/app/config/prisma";
import { redisClient } from "@/app/config/redis";
import { AppError } from "@/app/utils/appError";
import { checkUserStatus } from "@/app/utils/checkUserStatus";
import { comparePassword, hashPassword } from "@/app/utils/hash";
import { redis, RedisConstants } from "@/app/utils/redis";
import { clearAuthCookies, setAuthCookies } from "@/app/utils/setCookie";
import {
  createJwtPayload,
  createUserTokens,
  generateToken,
  verifyToken,
} from "@/app/utils/token";
import { AuthProviderName, UserStatus } from "@/generated/prisma/client";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { UserConstants } from "../user/user.constants";
import { AuthMessages } from "./auth.constants";
import type { AuthTypes } from "./auth.types";
import { AuthUtils } from "./auth.utils";

const register = async (input: AuthTypes.TRegisterInput) => {
  const { firstName, lastName, email, password } = input;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isVerified: true },
  });

  if (existing) {
    if (existing.isVerified) {
      throw new AppError(
        StatusCodes.CONFLICT,
        AuthMessages.EMAIL_ALREADY_EXISTS,
      );
    }
    await AuthUtils.sendOtpToEmail(email);
    return { message: AuthMessages.RESEND_SUCCESS };
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      status: UserStatus.PENDING,
      isVerified: false,
      authProviders: {
        create: {
          provider: AuthProviderName.CREDENTIAL,
          providerId: email,
        },
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  // await prisma.$transaction(async (tx) => {
  //   const user = await tx.user.create({
  //     data: {
  //       firstName,
  //       lastName,
  //       email,
  //       password: hashedPassword,
  //       status: UserStatus.PENDING,
  //       isVerified: false,
  //     },
  //   });

  //   await tx.authProvider.create({
  //     data: {
  //       provider: AuthProviderName.CREDENTIAL,
  //       providerId: user.email,
  //       userId: user.id,
  //     },
  //   });
  // });

  await AuthUtils.sendOtpToEmail(newUser.email);

  return { message: AuthMessages.REGISTER_SUCCESS };
};

const resendVerificationCode = async (
  input: AuthTypes.TResendVerificationInput,
) => {
  const { email } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isVerified: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, AuthMessages.USER_NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError(
      StatusCodes.CONFLICT,
      AuthMessages.ACCOUNT_ALREADY_VERIFIED,
    );
  }

  await AuthUtils.sendOtpToEmail(email);

  return { message: AuthMessages.RESEND_SUCCESS };
};

const verifyEmail = async (input: AuthTypes.TVerifyEmailInput) => {
  const { email, code } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isVerified: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, AuthMessages.USER_NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError(
      StatusCodes.CONFLICT,
      AuthMessages.ACCOUNT_ALREADY_VERIFIED,
    );
  }

  const otpKey = redis.getOtpRedisKey(email);
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp || storedOtp !== code) {
    throw new AppError(StatusCodes.BAD_REQUEST, AuthMessages.INVALID_OTP);
  }

  await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      verifiedAt: new Date(),
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
    },
  });

  const cooldownKey = redis.getOtpCooldownRedisKey(email);
  await redisClient.del(otpKey);
  await redisClient.del(cooldownKey);

  return { message: AuthMessages.VERIFY_EMAIL_SUCCESS };
};

const login = async (input: AuthTypes.TLoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      status: true,
      isVerified: true,
    },
  });

  if (!user || !user.password) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.INVALID_CREDENTIALS,
    );
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.INVALID_CREDENTIALS,
    );
  }

  checkUserStatus(user);

  const tokens = createUserTokens(user);

  const loggedInUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: UserConstants.USER_SAFE_SELECT,
  });

  return {
    message: AuthMessages.LOGIN_SUCCESS,
    tokens,
    user: loggedInUser,
  };
};

const refreshToken = async (req: Request, res: Response) => {
  const accessToken: string | undefined = req.cookies?.accessToken;
  const refreshToken: string | undefined = req.cookies?.refreshToken;

  if (!refreshToken || !accessToken) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.ACCESS_OR_REFRESH_TOKEN_MISSING,
    );
  }

  const blacklistRefreshTokenKey =
    redis.getRefreshTokenBlacklistRedisKey(refreshToken);
  const isBlacklisted = await redisClient.exists(blacklistRefreshTokenKey);

  if (isBlacklisted) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.REFRESH_TOKEN_BLACKLISTED,
    );
  }

  let verifiedPayload: JwtPayload;

  try {
    verifiedPayload = verifyToken(refreshToken, env.jwt.refreshTokenSecret);
  } catch {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.REFRESH_TOKEN_INVALID,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: verifiedPayload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      isVerified: true,
    },
  });

  checkUserStatus(user);

  await AuthUtils.blacklistTokens(req);

  const tokens = createUserTokens(user);
  setAuthCookies(res, tokens);

  return {
    message: AuthMessages.REFRESH_TOKEN_SUCCESS,
    tokens,
  };
};

const logout = async (req: Request, res: Response) => {
  await AuthUtils.blacklistTokens(req);
  clearAuthCookies(res);

  return {
    message: AuthMessages.LOGOUT_SUCCESS,
  };
};

const forgotPassword = async (input: AuthTypes.TForgotPasswordInput) => {
  const { email } = input;

  const cooldownKey = redis.getForgotPassCooldownRedisKey(email);
  const cooldownExists = await redisClient.exists(cooldownKey);

  if (cooldownExists) {
    const ttl = await redisClient.ttl(cooldownKey);
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `${AuthMessages.RESEND_FORGOT_PASSWORD_COOLDOWN} Try again in ${ttl} second(s).`,
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return { message: AuthMessages.FORGOT_PASSWORD_SUCCESS };
  }

  const payload = createJwtPayload(user);

  const resetToken = generateToken(
    payload,
    env.jwt.resetPassSecret,
    env.jwt.resetPassSecretExpiresIn,
  );

  const resetLink = `${env.resetPassLink}?token=${resetToken}`;

  await redisClient.setEx(
    cooldownKey,
    RedisConstants.FORGOT_PASS_COOLDOWN_SECONDS,
    "1",
  );

  await AuthUtils.sendPasswordResetEmail(user.email, resetLink);

  return { message: AuthMessages.FORGOT_PASSWORD_SUCCESS };
};

const resendForgotPassword = async (input: AuthTypes.TForgotPasswordInput) => {
  const { email } = input;

  const cooldownKey = redis.getForgotPassCooldownRedisKey(email);
  const cooldownExists = await redisClient.exists(cooldownKey);

  if (cooldownExists) {
    const ttl = await redisClient.ttl(cooldownKey);
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `${AuthMessages.RESEND_FORGOT_PASSWORD_COOLDOWN} Try again in ${ttl} second(s).`,
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return { message: AuthMessages.RESEND_FORGOT_PASSWORD_SUCCESS };
  }

  const payload = createJwtPayload(user);

  const resetToken = generateToken(
    payload,
    env.jwt.resetPassSecret,
    env.jwt.resetPassSecretExpiresIn,
  );

  const resetLink = `${env.resetPassLink}?token=${resetToken}`;

  await redisClient.setEx(
    cooldownKey,
    RedisConstants.FORGOT_PASS_COOLDOWN_SECONDS,
    "1",
  );

  await AuthUtils.sendPasswordResetEmail(user.email, resetLink);

  return { message: AuthMessages.RESEND_FORGOT_PASSWORD_SUCCESS };
};

const resetPassword = async (input: AuthTypes.TResetPasswordInput) => {
  const { token, newPassword } = input;

  const blacklistKey = redis.getForgotPassTokenBlacklistRedisKey(token);
  const isBlacklisted = await redisClient.exists(blacklistKey);

  if (isBlacklisted) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AuthMessages.RESET_PASSWORD_TOKEN_INVALID,
    );
  }

  let verifiedPayload: JwtPayload;

  try {
    verifiedPayload = verifyToken(token, env.jwt.resetPassSecret);
  } catch {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AuthMessages.RESET_PASSWORD_TOKEN_INVALID,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: verifiedPayload.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AuthMessages.RESET_PASSWORD_TOKEN_INVALID,
    );
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
    select: { id: true, email: true, role: true },
  });

  await AuthUtils.blacklistForgotPassToken(token);

  return { message: AuthMessages.RESET_PASSWORD_SUCCESS };
};

export const AuthServices = {
  register,
  resendVerificationCode,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resendForgotPassword,
  resetPassword,
};
