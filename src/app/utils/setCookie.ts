import type { Response } from 'express';
import { env } from '../config/env';
import { expiresInToMs } from './parser';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const isProduction = env.nodeEnv === 'production';

const setAuthCookies = (res: Response, tokens: AuthTokens): void => {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: expiresInToMs(env.jwt.accessTokenSecretExpiresIn),
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: expiresInToMs(env.jwt.refreshTokenSecretExpiresIn),
  });
};

const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
};

export { clearAuthCookies, setAuthCookies };
