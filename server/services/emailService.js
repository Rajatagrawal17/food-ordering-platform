import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.info('SMTP credentials not configured. Email service will run in log-only mock mode.');
    transporter = {
      sendMail: async (mailOptions) => {
        logger.info({ mailOptions }, '[MOCK EMAIL] Sending email notification');
        return { messageId: 'mock-id' };
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
};

export const emailService = {
  sendEmail: async ({ to, subject, html }) => {
    try {
      const client = getTransporter();
      const from = process.env.SMTP_FROM ?? 'Ember Bites <noreply@emberbites.com>';
      const info = await client.sendMail({
        from,
        to,
        subject,
        html,
      });
      logger.info({ messageId: info.messageId, to }, 'Email sent successfully');
      return true;
    } catch (error) {
      logger.error({ error, to }, 'Failed to send email notification');
      return false;
    }
  },
};
