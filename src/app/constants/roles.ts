import { UserRole } from "@/generated/prisma/client";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
};

export const hasMinimumRole = (
  userRole: UserRole,
  requiredRole: UserRole,
): boolean => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
