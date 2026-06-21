import { Gender, UserRole, UserStatus } from '@/generated/prisma/client';
import { z } from 'zod';
import { AuthValidation } from '../auth/auth.validation';

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name cannot be empty').max(50).optional().nullable(),
  lastName: z.string().trim().min(1, 'Last name cannot be empty').max(50).optional().nullable(),
  gender: z.enum(Gender).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  dateOfBirth: z.iso
    .datetime({ precision: 0, offset: true })
    .or(z.iso.date())
    .or(z.date())
    .optional()
    .nullable(),
  timezone: z.string().trim().max(50).optional().nullable(),
  locale: z.string().trim().max(10).optional().nullable(),
});

const updateStatusRoleSchema = z
  .object({
    role: z.enum(UserRole).optional(),
    status: z.enum(UserStatus).optional(),
  })
  .refine((data) => data.role !== undefined || data.status !== undefined, {
    message: 'At least one of role or status must be provided for update',
  });

const updateStatusSchema = z.object({
  status: z.enum(UserStatus),
});

const updateRoleSchema = z.object({
  role: z.enum(UserRole),
});

const createUserSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long')
    .max(30)
    .optional(),
  role: z.enum(UserRole).optional(),
  status: z.enum(UserStatus).optional(),
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  gender: z.enum(Gender).optional(),
  phone: z.string().trim().max(20).optional(),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: AuthValidation.passwordField,
});

const dateOrDateTime = z.preprocess((val) => {
  if (!val) return undefined;

  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(val + 'T00:00:00Z');
    }
    return new Date(val);
  }

  if (val instanceof Date) {
    return val;
  }

  return undefined;
}, z.date());

const queryUsersSchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1)).optional(),
  limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1)).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  cursor: z.string().optional(),
  direction: z.enum(['forward', 'backward']).optional(),
  searchTerm: z.string().optional(),
  role: z.enum(UserRole).optional(),
  status: z.enum(UserStatus).optional(),
  isVerified: z
    .preprocess(
      (val) =>
        val === 'true' || val === true
          ? true
          : val === 'false' || val === false
            ? false
            : undefined,
      z.boolean()
    )
    .optional(),
  gender: z.enum(Gender).optional(),

  // Dates (accept both formats, transform to Date)
  createdAt: dateOrDateTime.optional(),
  updatedAt: dateOrDateTime.optional(),
  lastLoginAt: dateOrDateTime.optional(),
  dateOfBirth: dateOrDateTime.optional(),

  createdAtFrom: dateOrDateTime.optional(),
  createdAtTo: dateOrDateTime.optional(),
  lastLoginAtFrom: dateOrDateTime.optional(),
  lastLoginAtTo: dateOrDateTime.optional(),
  dateOfBirthFrom: dateOrDateTime.optional(),
  dateOfBirthTo: dateOrDateTime.optional(),

  avatarSizeMin: z
    .preprocess((val) => (val ? Number(val) : undefined), z.number().nonnegative())
    .optional(),
  avatarSizeMax: z
    .preprocess((val) => (val ? Number(val) : undefined), z.number().nonnegative())
    .optional(),
});

const paramsIdSchema = z.object({
  id: z.uuid({
    error: 'Invalid ID format. Must be a valid UUID',
  }),
});

export const UserValidation = {
  updateProfileSchema,
  updateStatusRoleSchema,
  updateStatusSchema,
  updateRoleSchema,
  createUserSchema,
  changePasswordSchema,
  queryUsersSchema,
  paramsIdSchema,
  dateOrDateTime,
};
