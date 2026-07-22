import axios from 'axios';
import { logger } from '../utils/logger';
import { env } from './env';

export interface SendEmailOptions {
  email: string;
  subject: string;
  html: string;
}

const Messages = {
  FAILED_TO_SEND_EMAIL: (email: string) => `Failed to send email to ${email}:`,
} as const;

const url = 'https://api.brevo.com/v3/smtp/email';

export const sendEmail = async ({ email, subject, html }: SendEmailOptions): Promise<unknown> => {
  try {
    const response = await axios.post(
      url,
      {
        sender: {
          name: 'API Support',
          email: env.smtpBrevo.senderEmail,
        },
        to: [
          {
            email,
          },
        ],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': env.smtpBrevo.apiKey,
          'content-type': 'application/json',
        },
      }
    );

    return response;
  } catch (error) {
    logger.error(Messages.FAILED_TO_SEND_EMAIL(email), error);
    throw error;
  }
};
