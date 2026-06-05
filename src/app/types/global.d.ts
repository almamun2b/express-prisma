import type { ITokenPayload, TAuthUser } from "./jwt.types";

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
