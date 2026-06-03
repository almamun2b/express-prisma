import { z } from "zod";

const emailField = z
  .email("Must be a valid email address")
  .trim()
  .toLowerCase()
  .min(1, "Email is required");

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character",
  );

const nameField = (name: string) =>
  z
    .string()
    .trim()
    .min(1, `${name} is required`)
    .max(50, `${name} must be at most 50 characters`);

const otpCodeField = z
  .string()
  .trim()
  .length(6, "Verification code must be exactly 6 digits")
  .regex(/^\d{6}$/, "Verification code must contain only digits");

const registerSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  email: emailField,
  password: passwordField,
});

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

const verifyEmailSchema = z.object({
  email: emailField,
  code: otpCodeField,
});

const resendVerificationSchema = z.object({
  email: emailField,
});

const forgotPasswordSchema = z.object({
  email: emailField,
});

const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .trim()
    .min(1, "Refresh token is required")
    .optional(),
});

const logoutSchema = z.object({
  refreshToken: z
    .string()
    .trim()
    .min(1, "Refresh token is required")
    .optional(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: passwordField,
});

// export type TRegisterInput = z.infer<typeof registerSchema>;
// export type TLoginInput = z.infer<typeof loginSchema>;
// export type TVerifyEmailInput = z.infer<typeof verifyEmailSchema>;
// export type TResendVerificationInput = z.infer<typeof resendVerificationSchema>;
// export type TForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
// export type TResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const AuthValidation = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  logoutSchema,
};
