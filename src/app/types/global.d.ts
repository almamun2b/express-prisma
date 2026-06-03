import type { ITokenPayload, TAuthUser } from "./jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TAuthUser;
    }
  }
}

declare module "jsonwebtoken" {
  export interface JwtPayload extends ITokenPayload {}
}

export {};
