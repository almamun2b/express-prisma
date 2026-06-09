const getOtpEmailTemplate = (otp: string, expiresIn: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #333333; text-align: center; margin-bottom: 24px;">Verification Code</h2>
      <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        You recently requested a verification code for <strong>email verification</strong>. Please use the following code to proceed:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; padding: 16px 32px; background-color: #f4f4f5; color: #18181b; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 6px;">
          ${otp}
        </span>
      </div>
      <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        This code will expire in <strong>${expiresIn}</strong>. If you did not request this, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eaeaec; margin: 32px 0;" />
      <p style="color: #888888; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply.
      </p>
    </div>
  `;
};

const getPasswordResetEmailTemplate = (resetLink: string, expiresIn: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #333333; text-align: center; margin-bottom: 24px;">Reset Your Password</h2>
      <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        We received a request to reset the password for your account. Click the button below to create a new password.
        This link will expire in <strong>${expiresIn}</strong>.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}"
           style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
      </div>
      <p style="color: #555555; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
      </p>
      <p style="color: #888888; font-size: 13px; line-height: 1.5;">
        If you did not request a password reset, please ignore this email. Your password will remain unchanged.
      </p>
      <hr style="border: none; border-top: 1px solid #eaeaec; margin: 32px 0;" />
      <p style="color: #888888; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply.
      </p>
    </div>
  `;
};

export { getOtpEmailTemplate, getPasswordResetEmailTemplate };
