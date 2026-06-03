import type { Secret } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { TJwtExpiresIn } from "../types/environments";

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
    throw new Error("Invalid token payload");
  }
  return verifiedToken;
};

export { generateToken, verifyToken };
