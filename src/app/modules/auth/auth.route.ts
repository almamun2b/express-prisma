import { Router } from 'express';
import { UserRole } from 'generated/prisma/enums';
import { checkAuth } from 'src/app/middlewares/checkAuth';
import { validateRequest } from 'src/app/middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router: Router = Router();

router.post('/register', validateRequest(AuthValidation.registerSchema), AuthController.register);

router.post(
  '/resend-verification-code',
  validateRequest(AuthValidation.resendVerificationSchema),
  AuthController.resendVerificationCode
);

router.post(
  '/verify-email',
  validateRequest(AuthValidation.verifyEmailSchema),
  AuthController.verifyEmail
);

router.post('/login', validateRequest(AuthValidation.loginSchema), AuthController.login);

router.post('/refresh-token', AuthController.refreshToken);

router.post(
  '/logout',
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AuthController.logout
);

router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  '/resend-forgot-password',
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthController.resendForgotPassword
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword
);

export const AuthRoutes = router;
