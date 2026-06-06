import { type User } from "@/generated/prisma/client";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload, Secret } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import type { TJwtExpiresIn } from "../types/env.types";
import { AppError } from "./appError";
import { checkUserStatus } from "./checkUserStatus";
import { Codes } from "./codes";

const Messages = {
  INVALID_TOKEN_PAYLOAD: "Invalid token payload",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
} as const;

type TokenUser = Pick<User, "id" | "email" | "role">;

const generateToken = (
  payload: string | object | Buffer,
  secret: Secret | jwt.PrivateKey,
  expiresIn: TJwtExpiresIn,
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  });
  return token;
};

const extractBearerToken = (authorization?: string): string | undefined => {
  if (!authorization || typeof authorization !== "string") {
    return undefined;
  }

  const [scheme, token] = authorization.trim().split(" ");

  if (scheme?.toLowerCase() === "bearer" && token) {
    return token;
  }

  if (scheme && !token) {
    return scheme;
  }

  return undefined;
};

const verifyToken = (token: string, secret: Buffer | Secret) => {
  const verifiedToken = jwt.verify(token, secret);
  if (typeof verifiedToken === "string") {
    throw new Error(Messages.INVALID_TOKEN_PAYLOAD);
  }
  return verifiedToken;
};

const createJwtPayload = (user: TokenUser): JwtPayload => ({
  userId: user.id,
  email: user.email,
  role: user.role,
  jti: randomUUID(),
});

const createUserTokens = (user: TokenUser) => {
  const accessToken = generateToken(
    createJwtPayload(user),
    env.jwt.accessTokenSecret,
    env.jwt.accessTokenSecretExpiresIn,
  );

  const refreshToken = generateToken(
    createJwtPayload(user),
    env.jwt.refreshTokenSecret,
    env.jwt.refreshTokenSecretExpiresIn,
  );

  return { accessToken, refreshToken };
};

const regenerateTokens = async (refreshToken: string) => {
  let verified: JwtPayload;

  try {
    verified = verifyToken(refreshToken, env.jwt.refreshTokenSecret);
  } catch {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      Messages.INVALID_REFRESH_TOKEN,
      Codes.UNAUTHORIZED,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      deletedAt: true,
      isVerified: true,
    },
  });

  checkUserStatus(user);
  return createUserTokens(user);
};

export {
  createJwtPayload,
  createUserTokens,
  extractBearerToken,
  generateToken,
  regenerateTokens,
  verifyToken
};
