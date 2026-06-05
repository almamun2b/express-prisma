import { type User } from "@/generated/prisma/client";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import type { ITokenPayload } from "../types/jwt";
import { AppError } from "./appError";
import { checkUserStatus } from "./checkUserStatus";
import { Codes } from "./codes";
import { generateToken, verifyToken } from "./token";

type TokenUser = Pick<User, "id" | "email" | "role">;

const Messages = {
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
} as const;

const createJwtPayload = (user: TokenUser): ITokenPayload => ({
  userId: user.id,
  email: user.email,
  role: user.role,
});

const createUserTokens = (user: TokenUser) => {
  const jwtPayload = createJwtPayload(user);

  const accessToken = generateToken(
    jwtPayload,
    env.jwt.accessTokenSecret,
    env.jwt.accessTokenSecretExpiresIn,
  );

  const refreshToken = generateToken(
    jwtPayload,
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

export { createJwtPayload, createUserTokens, regenerateTokens };
