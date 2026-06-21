import { Prisma } from '@/generated/prisma/client';
import type { TUserQueryOptions } from './user.types';

const USER_SAFE_SELECT = {
  id: true,
  email: true,
  username: true,
  role: true,
  status: true,
  isVerified: true,
  verifiedAt: true,
  firstName: true,
  lastName: true,
  gender: true,
  phone: true,
  bio: true,
  address: true,
  dateOfBirth: true,
  timezone: true,
  locale: true,
  lastLoginAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  avatar: {
    select: {
      id: true,
      url: true,
      width: true,
      height: true,
      size: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const satisfies Prisma.UserSelect;

const USER_SEARCHABLE_FIELDS = ['email', 'username', 'firstName', 'lastName', 'phone'] as const;

const USER_FILTERABLE_FIELDS: (keyof TUserQueryOptions)[] = [
  'limit',
  'page',
  'sortBy',
  'sortOrder',
  'cursor',
  'direction',
  'searchTerm',
  'role',
  'status',
  'isVerified',
  'gender',
  'createdAtFrom',
  'createdAtTo',
  'lastLoginAtFrom',
  'lastLoginAtTo',
  'dateOfBirthFrom',
  'dateOfBirthTo',
  'avatarSizeMin',
  'avatarSizeMax',
] as const;

const UserMessages = {
  FETCH_SUCCESS: 'Users fetched successfully',
  DETAIL_SUCCESS: 'User details fetched successfully',
  PROFILE_SUCCESS: 'User profile fetched successfully',
  UPDATE_SUCCESS: 'User profile updated successfully',
  STATUS_ROLE_UPDATE_SUCCESS: 'User status and role updated successfully',
  SOFT_DELETE_SUCCESS: 'User soft deleted successfully',
  HARD_DELETE_SUCCESS: 'User permanently deleted successfully',
  USER_NOT_FOUND: 'User not found',
  DELETED_USER_NOT_FOUND: 'User not found or has been deleted',
  DEACTIVATE_SUCCESS: 'User deactivated successfully',
  REACTIVATE_SUCCESS: 'User reactivated successfully',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
  CREATE_SUCCESS: 'User created successfully',
  STATUS_UPDATE_SUCCESS: 'User status updated successfully',
  ROLE_UPDATE_SUCCESS: 'User role updated successfully',
  AVATAR_UPDATE_SUCCESS: 'Avatar updated successfully',
  AVATAR_DELETE_SUCCESS: 'Avatar deleted successfully',
  AVATAR_NOT_FOUND: 'Avatar not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  INCORRECT_OLD_PASSWORD: 'Old password is incorrect',
  NO_CREDENTIAL_BASED_LOGIN: 'User does not have credentials-based login enabled',
  SAME_PASSWORD_ERROR: 'New password cannot be the same as old password',
} as const;

const UserConstants = {
  USER_SAFE_SELECT,
  USER_SEARCHABLE_FIELDS,
  USER_FILTERABLE_FIELDS,
};

export { UserConstants, UserMessages };
