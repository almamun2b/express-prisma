import { env } from '@/app/config/env';
import { prisma } from '@/app/config/prisma';
import { redisClient } from '@/app/config/redis';
import { AppError } from '@/app/utils/appError';
import { checkUserStatus } from '@/app/utils/checkUserStatus';
import { redis } from '@/app/utils/redis';
import { extractBearerToken, verifyToken } from '@/app/utils/token';
import { UserRole } from '@/generated/prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { roleHasPermission, type Permission } from '../constants/permissions.constants';
import { Codes } from '../utils/codes';

const Messages = {
  UNAUTHORIZED: 'You are not authorized!',
  FORBIDDEN: 'You are not permitted to access this resource',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_TOKEN: 'Invalid authentication token. Please log in again.',
  TOKEN_REVOKED: 'Your session has been revoked. Please log in again.',
} as const;

const isJwtError = (error: unknown, name: string): boolean =>
  error instanceof Error && error.name === name;

const checkAuth =
  (...allowedRoles: UserRole[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies?.accessToken as string | undefined;
      const token = extractBearerToken(req.headers.authorization) ?? accessToken;

      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, Messages.UNAUTHORIZED, Codes.UNAUTHORIZED);
      }
      const verifiedToken = verifyToken(token, env.jwt.accessTokenSecret);

      const blacklistKey = redis.getAccessTokenBlacklistRedisKey(verifiedToken);
      const isBlocked = await redisClient.exists(blacklistKey);
      if (isBlocked) {
        throw new AppError(StatusCodes.UNAUTHORIZED, Messages.TOKEN_REVOKED, Codes.UNAUTHORIZED);
      }

      const user = await prisma.user.findUnique({
        where: { id: verifiedToken.userId },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          isVerified: true,
        },
      });

      checkUserStatus(user);

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new AppError(StatusCodes.FORBIDDEN, Messages.FORBIDDEN, Codes.FORBIDDEN);
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      next();
    } catch (error) {
      if (isJwtError(error, 'TokenExpiredError')) {
        return next(
          new AppError(StatusCodes.UNAUTHORIZED, Messages.TOKEN_EXPIRED, Codes.UNAUTHORIZED)
        );
      }
      if (isJwtError(error, 'JsonWebTokenError')) {
        return next(
          new AppError(StatusCodes.UNAUTHORIZED, Messages.INVALID_TOKEN, Codes.UNAUTHORIZED)
        );
      }
      next(error);
    }
  };

const checkPermission =
  (permission: Permission) => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, Messages.UNAUTHORIZED, Codes.UNAUTHORIZED)
      );
    }

    if (!roleHasPermission(req.user.role, permission)) {
      return next(new AppError(StatusCodes.FORBIDDEN, Messages.FORBIDDEN, Codes.FORBIDDEN));
    }

    next();
  };

export { checkAuth, checkPermission };
