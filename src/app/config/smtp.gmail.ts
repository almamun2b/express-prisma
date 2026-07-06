import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { env } from './env';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const Messages = {
  FAILED_TO_SEND_EMAIL: (email: string) => `Failed to send email to ${email}:`,
} as const;

const transporter = nodemailer.createTransport({
  host: env.emailSender.host,
  port: env.emailSender.port,
  secure: env.emailSender.port === 465, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env.emailSender.email,
    pass: env.emailSender.appPass,
  },
  tls: {
    rejectUnauthorized: env.nodeEnv !== 'development', // Only false in dev/Docker
  },
});

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"API Support" <${env.emailSender.email}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    logger.error(Messages.FAILED_TO_SEND_EMAIL(to), error);
    throw error;
  }
};
