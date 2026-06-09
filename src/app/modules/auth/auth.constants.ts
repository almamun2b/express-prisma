const AuthMessages = {
  REGISTER_SUCCESS: 'Registration successful. Please check your email for a verification code.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USER_NOT_VERIFIED: 'Your email is not verified. Please verify your email to continue.',

  RESEND_SUCCESS: 'Verification code resent successfully. Please check your email.',
  RESEND_COOLDOWN: 'Please wait before requesting another code.',
  ACCOUNT_ALREADY_VERIFIED: 'This account has already been verified.',
  USER_NOT_FOUND: 'No account found with this email address.',

  VERIFY_EMAIL_SUCCESS: 'Email verified successfully. You can now log in.',
  INVALID_OTP: 'The verification code is invalid or has expired.',

  LOGIN_SUCCESS: 'Logged in successfully.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_NOT_VERIFIED: 'Your email is not verified. Please verify your email to continue.',

  ACCESS_TOKEN_SUCCESS: 'Access token refreshed successfully.',
  ACCESS_TOKEN_MISSING: 'Access token not provided.',
  ACCESS_TOKEN_INVALID: 'Invalid or expired access token.',
  ACCESS_TOKEN_BLACKLISTED: 'Access token has been revoked.',

  REFRESH_TOKEN_SUCCESS: 'Tokens refreshed successfully.',
  REFRESH_TOKEN_MISSING: 'Refresh token not provided.',
  REFRESH_TOKEN_INVALID: 'Invalid or expired refresh token.',
  REFRESH_TOKEN_BLACKLISTED: 'Refresh token has been revoked.',

  ACCESS_OR_REFRESH_TOKEN_MISSING: 'Access or refresh token not provided.',

  LOGOUT_SUCCESS: 'Logged out successfully.',

  FORGOT_PASSWORD_SUCCESS: 'If this email is registered, a password reset link has been sent.',
  RESEND_FORGOT_PASSWORD_SUCCESS:
    'If this email is registered, a new password reset link has been sent.',
  RESEND_FORGOT_PASSWORD_COOLDOWN: 'Please wait before requesting another password reset link.',

  RESET_PASSWORD_SUCCESS: 'Password reset successfully. Please log in.',
  RESET_PASSWORD_TOKEN_INVALID: 'The password reset link is invalid or has expired.',
} as const;

export { AuthMessages };
