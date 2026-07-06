import type { Request, Response } from 'express';
import { AuthProviderName, UserStatus } from 'generated/prisma/client';
import { StatusCodes } from 'http-status-codes';
import type { JwtPayload } from 'jsonwebtoken';
import { env } from 'src/app/config/env';
import { prisma } from 'src/app/config/prisma';
import { redisClient } from 'src/app/config/redis';
import { AppError } from 'src/app/utils/appError';
import { checkUserStatus } from 'src/app/utils/checkUserStatus';
import { Codes } from 'src/app/utils/codes';
import { comparePassword, hashPassword } from 'src/app/utils/hash';
import { redis, RedisConstants } from 'src/app/utils/redis';
import { clearAuthCookies, setAuthCookies } from 'src/app/utils/setCookie';
import {
  createJwtPayload,
  createUserTokens,
  extractBearerToken,
  generateToken,
  verifyToken,
} from 'src/app/utils/token';
import { UserConstants } from '../user/user.constants';
import { AuthMessages } from './auth.constants';
import type {
  TForgotPasswordInput,
  TLoginInput,
  TRegisterInput,
  TResendVerificationInput,
  TResetPasswordInput,
  TVerifyEmailInput,
} from './auth.types';
import { AuthUtils } from './auth.utils';

const register = async (input: TRegisterInput) => {
  const { firstName, lastName, email, password, confirmPassword } = input;

  if (password !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AuthMessages.PASSWORDS_NOT_MATCH,
      Codes.BAD_REQUEST
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isVerified: true },
  });

  if (existing) {
    if (existing.isVerified) {
      throw new AppError(StatusCodes.CONFLICT, AuthMessages.EMAIL_ALREADY_EXISTS, Codes.CONFLICT);
    }
    await AuthUtils.sendOtpToEmail(email);
    return { message: AuthMessages.RESEND_SUCCESS };
  }

  const hashedPassword = await hashPassword(password);

  /*
   * Alternative approach to implement this logic:
   *
   * await prisma.$transaction(async (tx) => {
   *   const user = await tx.user.create({
   *     data: {
   *       firstName,
   *       lastName,
   *       email,
   *       password: hashedPassword,
   *       status: UserStatus.PENDING,
   *       isVerified: false,
   *     },
   *   });
   *
   *   await tx.authProvider.create({
   *     data: {
   *       provider: AuthProviderName.CREDENTIAL,
   *       providerId: user.email,
   *       userId: user.id,
   *     },
   *   });
   * });
   *
   */

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

  await AuthUtils.sendOtpToEmail(newUser.email);

  return { message: AuthMessages.REGISTER_SUCCESS };
};

const resendVerificationCode = async (input: TResendVerificationInput) => {
  const { email } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isVerified: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, AuthMessages.USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError(StatusCodes.CONFLICT, AuthMessages.ACCOUNT_ALREADY_VERIFIED, Codes.CONFLICT);
  }

  await AuthUtils.sendOtpToEmail(email);

  return { message: AuthMessages.RESEND_SUCCESS };
};

const verifyEmail = async (input: TVerifyEmailInput) => {
  const { email, code } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isVerified: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, AuthMessages.USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError(StatusCodes.CONFLICT, AuthMessages.ACCOUNT_ALREADY_VERIFIED, Codes.CONFLICT);
  }

  const otpKey = redis.getOtpRedisKey(email);
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp || storedOtp !== code) {
    throw new AppError(StatusCodes.BAD_REQUEST, AuthMessages.INVALID_OTP, Codes.BAD_REQUEST);
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

const login = async (input: TLoginInput) => {
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

  if (!user?.password) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.INVALID_CREDENTIALS,
      Codes.UNAUTHORIZED
    );
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.INVALID_CREDENTIALS,
      Codes.UNAUTHORIZED
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
  const accessToken =
    (req.cookies?.accessToken as string | undefined) ??
    extractBearerToken(req.headers.authorization);
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (!refreshToken || !accessToken) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.ACCESS_OR_REFRESH_TOKEN_MISSING,
      Codes.UNAUTHORIZED
    );
  }

  let verifiedPayload: JwtPayload;

  try {
    verifiedPayload = verifyToken(refreshToken, env.jwt.refreshTokenSecret);
  } catch {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.REFRESH_TOKEN_INVALID,
      Codes.UNAUTHORIZED
    );
  }

  const blacklistRefreshTokenKey = redis.getRefreshTokenBlacklistRedisKey(verifiedPayload);
  const isBlacklisted = await redisClient.exists(blacklistRefreshTokenKey);

  if (isBlacklisted) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.REFRESH_TOKEN_BLACKLISTED,
      Codes.UNAUTHORIZED
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

const forgotPassword = async (input: TForgotPasswordInput) => {
  const { email } = input;

  const cooldownKey = redis.getForgotPassCooldownRedisKey(email);
  const cooldownExists = await redisClient.exists(cooldownKey);

  if (cooldownExists) {
    const ttl = await redisClient.ttl(cooldownKey);
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `${AuthMessages.RESEND_FORGOT_PASSWORD_COOLDOWN} Try again in ${ttl} second(s).`,
      Codes.TOO_MANY_REQUESTS
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
    env.jwt.resetPassSecretExpiresIn
  );

  const resetLink = `${env.resetPassLink}?token=${resetToken}`;

  await redisClient.setEx(cooldownKey, RedisConstants.FORGOT_PASS_COOLDOWN_SECONDS, '1');

  await AuthUtils.sendPasswordResetEmail(user.email, resetLink);

  return { message: AuthMessages.FORGOT_PASSWORD_SUCCESS };
};

const resendForgotPassword = async (input: TForgotPasswordInput) => {
  const { email } = input;

  const cooldownKey = redis.getForgotPassCooldownRedisKey(email);
  const cooldownExists = await redisClient.exists(cooldownKey);

  if (cooldownExists) {
    const ttl = await redisClient.ttl(cooldownKey);
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `${AuthMessages.RESEND_FORGOT_PASSWORD_COOLDOWN} Try again in ${ttl} second(s).`,
      Codes.TOO_MANY_REQUESTS
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
    env.jwt.resetPassSecretExpiresIn
  );

  const resetLink = `${env.resetPassLink}?token=${resetToken}`;

  await redisClient.setEx(cooldownKey, RedisConstants.FORGOT_PASS_COOLDOWN_SECONDS, '1');

  await AuthUtils.sendPasswordResetEmail(user.email, resetLink);

  return { message: AuthMessages.RESEND_FORGOT_PASSWORD_SUCCESS };
};

const resetPassword = async (input: TResetPasswordInput) => {
  const { token, newPassword } = input;

  let verifiedPayload: JwtPayload;

  try {
    verifiedPayload = verifyToken(token, env.jwt.resetPassSecret);
  } catch {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AuthMessages.RESET_PASSWORD_TOKEN_INVALID,
      Codes.BAD_REQUEST
    );
  }

  const blacklistKey = redis.getForgotPassTokenBlacklistRedisKey(verifiedPayload);
  const isBlacklisted = await redisClient.exists(blacklistKey);

  if (isBlacklisted) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AuthMessages.RESET_PASSWORD_TOKEN_INVALID,
      Codes.BAD_REQUEST
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
      Codes.BAD_REQUEST
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
