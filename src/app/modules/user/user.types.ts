import type { z } from 'zod';
import type { UserValidation } from './user.validation';

export type TUserQueryOptions = z.infer<typeof UserValidation.queryUsersSchema>;
export type TUpdateProfileInput = z.infer<typeof UserValidation.updateProfileSchema>;
export type TUpdateStatusRoleInput = z.infer<typeof UserValidation.updateStatusRoleSchema>;
export type TUpdateStatusInput = z.infer<typeof UserValidation.updateStatusSchema>;
export type TUpdateRoleInput = z.infer<typeof UserValidation.updateRoleSchema>;
export type TCreateUserInput = z.infer<typeof UserValidation.createUserSchema>;
export type TChangePasswordInput = z.infer<typeof UserValidation.changePasswordSchema>;
