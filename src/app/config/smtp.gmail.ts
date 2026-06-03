import { env } from "@/app/config/env";
import { logger } from "@/app/utils/logger";
import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: env.emailSender.host,
  port: env.emailSender.port,
  secure: env.emailSender.port === 465, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env.emailSender.email,
    pass: env.emailSender.appPass,
  },
  tls: {
    rejectUnauthorized: env.nodeEnv !== "development", // Only false in dev/Docker
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"API Support" <${env.emailSender.email}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
};
