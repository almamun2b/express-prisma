import type { JwtUserPayload, TAuthUser } from './jwt.types';

declare global {
  namespace Express {
    interface Request {
      user?: TAuthUser;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

declare module 'jsonwebtoken' {
  export interface JwtPayload extends JwtUserPayload {
    jti?: string;
  }
}

export {};
