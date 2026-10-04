import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let transporter = null;

/**
 * Initialize and validate the Nodemailer SMTP transporter
 */
const createTransporter = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    logger.error(
      "❌ SMTP is misconfigured: Ensure SMTP_HOST, SMTP_USER, and SMTP_PASS are set in .env"
    );
    return null;
  }

  try {
    const port = Number(env.SMTP_PORT) || 587;
    const isSecure = port === 465;

    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure: isSecure,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  } catch (err) {
    logger.error("❌ Failed to create Nodemailer transport:", err.message);
    return null;
  }
};

/**
 * Get cached transporter instance or initialize if needed
 */
export const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send an email with retry support on transient network/SMTP failures
 * Will not throw or crash the calling request on error; logs and returns boolean.
 *
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML message body
 * @param {number} maxRetries - Retry count on transient error (default 2)
 * @returns {Promise<boolean>}
 */
export const sendEmail = async (to, subject, html, maxRetries = 2) => {
  const transport = getTransporter();
  if (!transport) {
    logger.error(
      `❌ Email delivery skipped for ${to}: SMTP is not configured.`
    );
    return false;
  }

  const mailOptions = {
    from: `TaskHub <${env.FROM_EMAIL || env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const info = await transport.sendMail(mailOptions);
      logger.info(
        `📧 Email sent successfully to ${to} [MessageId: ${info.messageId}]`
      );
      return true;
    } catch (error) {
      attempt++;
      const isTransient =
        ["ECONNRESET", "ETIMEDOUT", "ESOCKET", "ECONNREFUSED"].includes(
          error.code
        ) ||
        (error.responseCode &&
          error.responseCode >= 400 &&
          error.responseCode < 500);

      logger.warn(
        `Email delivery attempt ${attempt} to ${to} failed: ${error.message}`
      );

      if (attempt <= maxRetries && isTransient) {
        const delay = attempt * 1000;
        logger.info(`Retrying email delivery to ${to} in ${delay}ms...`);
        await sleep(delay);
      } else {
        logger.error(
          `❌ Email delivery failed permanently for ${to} after ${attempt} attempt(s): ${error.message}`
        );
        return false;
      }
    }
  }

  return false;
};

export default sendEmail;
