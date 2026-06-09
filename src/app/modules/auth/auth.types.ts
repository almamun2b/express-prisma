import type z from 'zod';
import type { AuthValidation } from './auth.validation';

export type TRegisterInput = z.infer<typeof AuthValidation.registerSchema>;
export type TLoginInput = z.infer<typeof AuthValidation.loginSchema>;
export type TVerifyEmailInput = z.infer<typeof AuthValidation.verifyEmailSchema>;
export type TResendVerificationInput = z.infer<typeof AuthValidation.resendVerificationSchema>;
export type TForgotPasswordInput = z.infer<typeof AuthValidation.forgotPasswordSchema>;
export type TResetPasswordInput = z.infer<typeof AuthValidation.resetPasswordSchema>;
