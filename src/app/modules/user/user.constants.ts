import { Prisma } from '@/generated/prisma/client';

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
      createdAt: true,
      updatedAt: true,
    },
  },
} as const satisfies Prisma.UserSelect;

export const UserConstants = {
  USER_SAFE_SELECT,
};
