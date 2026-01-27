import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads an HTML template file and replaces placeholders with actual values
 * @param {string} templateName - Name of the template file (e.g., 'OTP', 'SignUp')
 * @param {object} replacements - Object with key-value pairs for replacements (e.g., {name: 'John', otp: '123456'})
 * @returns {string} - HTML content with replaced placeholders
 */
export function getTemplate(templateName, replacements = {}) {
  try {
    const templatePath = path.join(
      __dirname,
      "templates",
      `${templateName}.html`,
    );
    let html = fs.readFileSync(templatePath, "utf8");

    // Replace all placeholders in the format {{key}}
    for (const key of Object.keys(replacements)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, replacements[key]);
    }

    return html;
  } catch (error) {
    console.error(`Error reading template ${templateName}:`, error);
    throw error;
  }
}

export async function sendMail({ subject, body, to, consoleMessage }) {
  const { GMAIL_USER, GMAIL_PASS } = process.env;

  if (!GMAIL_USER || !GMAIL_PASS) {
    throw new Error(
      "GMAIL_USER and GMAIL_PASS must be set in environment variables",
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // Use port 587 instead of 465
    secure: false, // Use STARTTLS instead of SSL
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    pool: true,
    maxConnections: 5,
    maxMessages: 10,
    logger: true,
    debug: true,
  });

  const mailOptions = {
    from: GMAIL_USER,
    to,
    subject,
    html: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (consoleMessage) {
      console.log(consoleMessage);
    }
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/**
 * Sends an OTP email using the OTP template
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} otp - OTP code to send
 */
export async function sendOtpEmail(to, name, otp) {
  const html = getTemplate("OTP", { name, otp });
  await sendMail({
    subject: "OTP Verification - Expense Tracker",
    body: html,
    to,
    consoleMessage: `OTP email sent to ${to}`,
  });
}
