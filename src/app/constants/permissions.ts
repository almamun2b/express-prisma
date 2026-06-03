import { UserRole } from "@/generated/prisma/client";

export const Permission = {
  USER_LIST: "user:list",
  USER_DETAIL: "user:detail",
  USER_UPDATE: "user:update",
  USER_SOFT_DELETE: "user:soft-delete",
  USER_HARD_DELETE: "user:hard-delete",
  USER_MANAGE_ROLES: "user:manage-roles",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.USER_LIST,
    Permission.USER_DETAIL,
    Permission.USER_UPDATE,
    Permission.USER_SOFT_DELETE,
  ],
  [UserRole.USER]: [],
};

export const roleHasPermission = (
  role: UserRole,
  permission: Permission,
): boolean => ROLE_PERMISSIONS[role].includes(permission);

export const authorizeRoles = (...roles: UserRole[]) => roles;
