import { randomInt } from "crypto";
import type { Secret } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { TJwtExpiresIn } from "../types/env.types";
import { RedisConstants } from "./redis";

const Messages = {
  INVALID_TOKEN_PAYLOAD: "Invalid token payload",
} as const;

const generateOtp = (): string => {
  let otp = "";
  for (let i = 0; i < RedisConstants.OTP_LENGTH; i++) {
    otp += randomInt(0, 10).toString();
  }
  return otp;
};

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

const verifyToken = (token: string, secret: Buffer | Secret) => {
  const verifiedToken = jwt.verify(token, secret);
  if (typeof verifiedToken === "string") {
    throw new Error(Messages.INVALID_TOKEN_PAYLOAD);
  }
  return verifiedToken;
};

export { generateOtp, generateToken, verifyToken };
