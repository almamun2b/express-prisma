import type { TJwtExpiresIn } from "./jwt.types";

interface IEnv {
  nodeEnv: "development" | "production";
  port: number;
  databaseUrl: string;
  bcryptSaltRound: number;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  jwt: {
    accessTokenSecret: string;
    accessTokenSecretExpiresIn: TJwtExpiresIn;
    refreshTokenSecret: string;
    refreshTokenSecretExpiresIn: TJwtExpiresIn;
    resetPassSecret: string;
    resetPassSecretExpiresIn: TJwtExpiresIn;
  };
  openRouter: {
    apiKey: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  clientUrl: string;
  corsOrigins: string[];
  resetPassLink: string;
  emailSender: {
    email: string;
    appPass: string;
    host: string;
    port: number;
  };
  defaultUsers: {
    superAdminEmail: string;
    superAdminPassword: string;
    adminEmail: string;
    adminPassword: string;
  };
  redis: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
}

enum EnvEnum {
  NODE_ENV = "NODE_ENV",
  PORT = "PORT",
  DATABASE_URL = "DATABASE_URL",
  BCRYPT_SALT_ROUND = "BCRYPT_SALT_ROUND",
  CLOUDINARY_CLOUD_NAME = "CLOUDINARY_CLOUD_NAME",
  CLOUDINARY_API_KEY = "CLOUDINARY_API_KEY",
  CLOUDINARY_API_SECRET = "CLOUDINARY_API_SECRET",
  JWT_ACCESS_TOKEN_SECRET = "JWT_ACCESS_TOKEN_SECRET",
  JWT_ACCESS_TOKEN_SECRET_EXPIRES_IN = "JWT_ACCESS_TOKEN_SECRET_EXPIRES_IN",
  JWT_REFRESH_TOKEN_SECRET = "JWT_REFRESH_TOKEN_SECRET",
  JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN = "JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN",
  JWT_RESET_PASS_SECRET = "JWT_RESET_PASS_SECRET",
  JWT_RESET_PASS_SECRET_EXPIRES_IN = "JWT_RESET_PASS_SECRET_EXPIRES_IN",
  OPEN_ROUTER_API_KEY = "OPEN_ROUTER_API_KEY",
  STRIPE_SECRET_KEY = "STRIPE_SECRET_KEY",
  STRIPE_WEBHOOK_SECRET = "STRIPE_WEBHOOK_SECRET",
  CLIENT_URL = "CLIENT_URL",
  CORS_ORIGINS = "CORS_ORIGINS",
  RESET_PASS_URL = "RESET_PASS_URL",
  EMAIL_SENDER_EMAIL = "EMAIL_SENDER_EMAIL",
  EMAIL_SENDER_APP_PASS = "EMAIL_SENDER_APP_PASS",
  EMAIL_SENDER_HOST = "EMAIL_SENDER_HOST",
  EMAIL_SENDER_PORT = "EMAIL_SENDER_PORT",
  SUPER_ADMIN_EMAIL = "SUPER_ADMIN_EMAIL",
  SUPER_ADMIN_PASS = "SUPER_ADMIN_PASS",
  ADMIN_EMAIL = "ADMIN_EMAIL",
  ADMIN_PASS = "ADMIN_PASS",
  REDIS_HOST = "REDIS_HOST",
  REDIS_PORT = "REDIS_PORT",
  REDIS_USERNAME = "REDIS_USERNAME",
  REDIS_PASSWORD = "REDIS_PASSWORD",
}

type TEnvValueType = "string" | "number" | "array" | "jwt_expires_in";

type TEnvReturnType<T extends TEnvValueType> = T extends "number"
  ? number
  : T extends "array"
    ? string[]
    : T extends "jwt_expires_in"
      ? TJwtExpiresIn
      : string;

export {
  EnvEnum,
  type IEnv,
  type TEnvReturnType,
  type TEnvValueType,
  type TJwtExpiresIn,
};
