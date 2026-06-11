import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import type { IEnv, TEnvReturnType, TEnvValueType } from '../types/env.types';
import { EnvEnum } from '../types/env.types';
import { AppError } from '../utils/appError';
import { Codes } from '../utils/codes';

dotenv.config();

const Messages = {
  MISSING_REQUIRED_ENV_VAR: (name: string) => `Missing required environment variable "${name}"`,
  UNDEFINED_ENV_VAR: 'Environment variable name is undefined or missing. Please check for typos.',
  INVALID_JWT_EXPIRES_IN: (name: string) =>
    `Environment variable "${name}" must be a valid JWT expiration time (e.g.,2ms, 3s, 4m, 5h, 6d, 7w, 8y)`,
  INVALID_NUMBER: (name: string) => `Environment variable "${name}" must be a valid number`,
} as const;

const getEnvVar = <T extends TEnvValueType = 'string'>(
  name: EnvEnum,
  type: T = 'string' as T
): TEnvReturnType<T> => {
  if (!name) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      Messages.UNDEFINED_ENV_VAR,
      Codes.INTERNAL_SERVER_ERROR
    );
  }

  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      Messages.MISSING_REQUIRED_ENV_VAR(name),
      Codes.INTERNAL_SERVER_ERROR
    );
  }

  switch (type) {
    case 'number': {
      const parsedValue = Number(value);

      if (Number.isNaN(parsedValue)) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          Messages.INVALID_NUMBER(name),
          Codes.BAD_REQUEST
        );
      }

      return parsedValue as TEnvReturnType<T>;
    }

    case 'array':
      return value.split(',').map((item) => item.trim()) as TEnvReturnType<T>;

    case 'jwt_expires_in': {
      const jwtRegex = /^\d+(ms|s|m|h|d|y)$/;
      if (!jwtRegex.test(value)) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          Messages.INVALID_JWT_EXPIRES_IN(name),
          Codes.BAD_REQUEST
        );
      }
      return value as TEnvReturnType<T>;
    }

    default:
      return value as TEnvReturnType<T>;
  }
};

const buildEnv = (): IEnv => ({
  nodeEnv: getEnvVar(EnvEnum.NODE_ENV) as 'development' | 'production',
  port: getEnvVar(EnvEnum.PORT, 'number'),
  appName: getEnvVar(EnvEnum.APP_NAME),
  databaseUrl: getEnvVar(EnvEnum.DATABASE_URL),
  bcryptSaltRound: getEnvVar(EnvEnum.BCRYPT_SALT_ROUND, 'number'),
  cloudinary: {
    cloudName: getEnvVar(EnvEnum.CLOUDINARY_CLOUD_NAME),
    apiKey: getEnvVar(EnvEnum.CLOUDINARY_API_KEY),
    apiSecret: getEnvVar(EnvEnum.CLOUDINARY_API_SECRET),
  },
  jwt: {
    accessTokenSecret: getEnvVar(EnvEnum.JWT_ACCESS_TOKEN_SECRET),
    accessTokenSecretExpiresIn: getEnvVar(
      EnvEnum.JWT_ACCESS_TOKEN_SECRET_EXPIRES_IN,
      'jwt_expires_in'
    ),
    refreshTokenSecret: getEnvVar(EnvEnum.JWT_REFRESH_TOKEN_SECRET),
    refreshTokenSecretExpiresIn: getEnvVar(
      EnvEnum.JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN,
      'jwt_expires_in'
    ),
    resetPassSecret: getEnvVar(EnvEnum.JWT_RESET_PASS_SECRET),
    resetPassSecretExpiresIn: getEnvVar(EnvEnum.JWT_RESET_PASS_SECRET_EXPIRES_IN, 'jwt_expires_in'),
  },
  clientUrl: getEnvVar(EnvEnum.CLIENT_URL),
  corsOrigins: getEnvVar(EnvEnum.CORS_ORIGINS, 'array'),
  resetPassLink: getEnvVar(EnvEnum.RESET_PASS_URL),
  emailSender: {
    email: getEnvVar(EnvEnum.EMAIL_SENDER_EMAIL),
    appPass: getEnvVar(EnvEnum.EMAIL_SENDER_APP_PASS),
    host: getEnvVar(EnvEnum.EMAIL_SENDER_HOST),
    port: getEnvVar(EnvEnum.EMAIL_SENDER_PORT, 'number'),
  },
  defaultUsers: {
    superAdminEmail: getEnvVar(EnvEnum.SUPER_ADMIN_EMAIL),
    superAdminPassword: getEnvVar(EnvEnum.SUPER_ADMIN_PASS),
    adminEmail: getEnvVar(EnvEnum.ADMIN_EMAIL),
    adminPassword: getEnvVar(EnvEnum.ADMIN_PASS),
  },
  redis: {
    host: getEnvVar(EnvEnum.REDIS_HOST),
    port: getEnvVar(EnvEnum.REDIS_PORT, 'number'),
    username: getEnvVar(EnvEnum.REDIS_USERNAME),
    password: getEnvVar(EnvEnum.REDIS_PASSWORD),
  },
});

let env: IEnv;

try {
  env = buildEnv();
} catch (error) {
  if (error instanceof AppError) {
    console.error(`[env] Error: ${error.message}\n`);
    process.exit(1);
  }
  throw error;
}

export { env };
