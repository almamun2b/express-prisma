import axios from "axios";
import { logger } from "../utils/logger";
import { env } from "./env";

export interface SendEmailOptions {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  email,
  subject,
  html,
}: SendEmailOptions): Promise<any> => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "API",
          email: env.emailSender.email,
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
          accept: "application/json",
          "api-key": env.emailSender.appPass,
          "content-type": "application/json",
        },
      },
    );

    return response;
  } catch (error) {
    logger.error(`Failed to send email to ${email}:`, error);
    throw error;
  }
};
