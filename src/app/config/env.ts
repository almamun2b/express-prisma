import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import type {
  IEnv,
  TEnvReturnType,
  TEnvValueType,
} from "../types/environments";
import { EnvEnum } from "../types/environments";
import { AppError } from "../utils/AppError";

dotenv.config();

const getEnvVar = <T extends TEnvValueType = "string">(
  name: EnvEnum,
  type: T = "string" as T,
): TEnvReturnType<T> => {
  if (!name) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Environment variable name is undefined or missing. Please check for typos.`,
    );
  }

  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Missing required environment variable "${name}"`,
    );
  }

  switch (type) {
    case "number": {
      const parsedValue = Number(value);

      if (Number.isNaN(parsedValue)) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Environment variable "${name}" must be a valid number`,
        );
      }

      return parsedValue as TEnvReturnType<T>;
    }

    case "array":
      return value.split(",").map((item) => item.trim()) as TEnvReturnType<T>;

    case "jwt_expires_in": {
      const jwtRegex = /^\d+(ms|s|m|h|d|y)$/;
      if (!jwtRegex.test(value)) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Environment variable "${name}" must be a valid JWT expiration time (e.g.,2ms, 3s, 4m, 5h, 6d, 7w, 8y)`,
        );
      }
      return value as TEnvReturnType<T>;
    }

    default:
      return value as TEnvReturnType<T>;
  }
};

const buildEnv = (): IEnv => ({
  nodeEnv: getEnvVar(EnvEnum.NODE_ENV) as "development" | "production",
  port: getEnvVar(EnvEnum.PORT, "number"),
  databaseUrl: getEnvVar(EnvEnum.DATABASE_URL),
  bcryptSaltRound: getEnvVar(EnvEnum.BCRYPT_SALT_ROUND, "number"),
  cloudinary: {
    cloudName: getEnvVar(EnvEnum.CLOUDINARY_CLOUD_NAME),
    apiKey: getEnvVar(EnvEnum.CLOUDINARY_API_KEY),
    apiSecret: getEnvVar(EnvEnum.CLOUDINARY_API_SECRET),
  },
  jwt: {
    accessTokenSecret: getEnvVar(EnvEnum.JWT_ACCESS_TOKEN_SECRET),
    accessTokenSecretExpiresIn: getEnvVar(
      EnvEnum.JWT_ACCESS_TOKEN_SECRET_EXPIRES_IN,
      "jwt_expires_in",
    ),
    refreshTokenSecret: getEnvVar(EnvEnum.JWT_REFRESH_TOKEN_SECRET),
    refreshTokenSecretExpiresIn: getEnvVar(
      EnvEnum.JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN,
      "jwt_expires_in",
    ),
    resetPassSecret: getEnvVar(EnvEnum.JWT_RESET_PASS_SECRET),
    resetPassSecretExpiresIn: getEnvVar(
      EnvEnum.JWT_RESET_PASS_SECRET_EXPIRES_IN,
      "jwt_expires_in",
    ),
  },
  openRouter: {
    apiKey: getEnvVar(EnvEnum.OPEN_ROUTER_API_KEY),
  },
  stripe: {
    secretKey: getEnvVar(EnvEnum.STRIPE_SECRET_KEY),
    webhookSecret: getEnvVar(EnvEnum.STRIPE_WEBHOOK_SECRET),
  },
  clientUrl: getEnvVar(EnvEnum.CLIENT_URL),
  corsOrigins: getEnvVar(EnvEnum.CORS_ORIGINS, "array"),
  resetPassLink: getEnvVar(EnvEnum.RESET_PASS_URL),
  emailSender: {
    email: getEnvVar(EnvEnum.EMAIL_SENDER_EMAIL),
    appPass: getEnvVar(EnvEnum.EMAIL_SENDER_APP_PASS),
    host: getEnvVar(EnvEnum.EMAIL_SENDER_HOST),
    port: getEnvVar(EnvEnum.EMAIL_SENDER_PORT, "number"),
  },
  defaultUsers: {
    superAdminEmail: getEnvVar(EnvEnum.SUPER_ADMIN_EMAIL),
    superAdminPassword: getEnvVar(EnvEnum.SUPER_ADMIN_PASS),
    adminEmail: getEnvVar(EnvEnum.ADMIN_EMAIL),
    adminPassword: getEnvVar(EnvEnum.ADMIN_PASS),
  },
  redis: {
    host: getEnvVar(EnvEnum.REDIS_HOST),
    port: getEnvVar(EnvEnum.REDIS_PORT, "number"),
    username: getEnvVar(EnvEnum.REDIS_USERNAME),
    password: getEnvVar(EnvEnum.REDIS_PASSWORD),
  },
});

let env: IEnv;

try {
  env = buildEnv();
} catch (error) {
  if (error instanceof AppError) {
    console.error(`[env] ${error.message}`);
    process.exit(1);
  }
  throw error;
}

export { env };
