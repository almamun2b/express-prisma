import type { User } from "@/generated/prisma/client";
import type { UserRole } from "@/generated/prisma/enums";

type TAuthUser = Pick<User, "id" | "email" | "role" | "status">;

type TJwtExpiresIn =
  | `${number}ms` // milliseconds
  | `${number}s` // seconds
  | `${number}m` // minutes
  | `${number}h` // hours
  | `${number}d` // days
  | `${number}w` // weeks
  | `${number}y`; // years

interface ITokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export type { ITokenPayload, TAuthUser, TJwtExpiresIn };
