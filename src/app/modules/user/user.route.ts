import express, { Router } from 'express';
import { UserRole } from 'generated/prisma/client';
import { checkAuth } from 'src/app/middlewares/checkAuth';
import {
  parseMultipartRequest,
  validateParams,
  validateQuery,
  validateRequest,
} from 'src/app/middlewares/validateRequest';
import { fileUploader } from 'src/app/utils/fileUploader';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';

const router: Router = express.Router();

router.get(
  '/',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateQuery(UserValidation.queryUsersSchema),
  UserControllers.getAllUsers
);

router.get(
  '/cursor',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateQuery(UserValidation.queryUsersSchema),
  UserControllers.getAllUsersWithCursor
);

router.post(
  '/',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(UserValidation.createUserSchema),
  UserControllers.createUser
);

router.get(
  '/me',
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.getMyProfile
);

router.patch(
  '/me',
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(UserValidation.updateProfileSchema),
  UserControllers.updateMyProfile
);

router.patch(
  '/me/profile',
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single('avatar'),
  parseMultipartRequest,
  validateRequest(UserValidation.updateProfileSchema),
  UserControllers.updateMyProfile
);

router.patch(
  '/me/avatar',
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single('avatar'),
  UserControllers.updateMyAvatar
);

router.delete(
  '/me/avatar',
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.deleteMyAvatar
);

router.patch(
  '/me/change-password',
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(UserValidation.changePasswordSchema),
  UserControllers.changeMyPassword
);

router.patch(
  '/me/deactivate',
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.deactivateMyAccount
);

router.patch(
  '/me/reactivate',
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.reactivateMyAccount
);

router.get(
  '/:id',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(UserValidation.paramsIdSchema),
  UserControllers.getUserById
);

router.patch(
  '/:id/status',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(UserValidation.paramsIdSchema),
  validateRequest(UserValidation.updateStatusSchema),
  UserControllers.updateUserStatus
);

router.patch(
  '/:id/role',
  checkAuth(UserRole.SUPER_ADMIN),
  validateParams(UserValidation.paramsIdSchema),
  validateRequest(UserValidation.updateRoleSchema),
  UserControllers.updateUserRole
);

router.delete(
  '/:id',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(UserValidation.paramsIdSchema),
  UserControllers.softDeleteUser
);

router.delete(
  '/:id/hard',
  checkAuth(UserRole.SUPER_ADMIN),
  validateParams(UserValidation.paramsIdSchema),
  UserControllers.hardDeleteUser
);

export const UserRoutes = router;
