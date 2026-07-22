import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { env } from './env';

interface SendEmailOptions {
  email: string;
  subject: string;
  html: string;
}

const Messages = {
  FAILED_TO_SEND_EMAIL: (email: string) => `Failed to send email to ${email}:`,
} as const;

const transporter = nodemailer.createTransport({
  host: env.smtpGoogle.host,
  port: env.smtpGoogle.port,
  secure: env.smtpGoogle.port === 465, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env.smtpGoogle.senderEmail,
    pass: env.smtpGoogle.appPass,
  },
  tls: {
    rejectUnauthorized: env.nodeEnv !== 'development', // Only false in dev/Docker
  },
});

export const sendEmail = async ({ email, subject, html }: SendEmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"API Support" <${env.smtpGoogle.senderEmail}>`,
      to: email,
      subject,
      html,
    });
    return info;
  } catch (error) {
    logger.error(Messages.FAILED_TO_SEND_EMAIL(email), error);
    throw error;
  }
};
