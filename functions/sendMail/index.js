import { sendMail, getTemplate } from "./sendMail.js";

/**
 * AWS Lambda handler for sending emails via API Gateway (HTTP API or REST API proxy)
 *
 * Expected event body (JSON string):
 * {
 *   "to": "recipient@example.com",           // Required
 *   "subject": "Email Subject",              // Required
 *   "body": "<h1>HTML content</h1>",         // Optional if templateName provided
 *   "templateName": "OTP",                   // Optional (e.g., 'OTP', 'SignUp')
 *   "replacements": {"name": "John", "otp": "123456"}  // Optional, for template
 * }
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  // Only accept POST requests
  const method = event.requestContext?.http?.method ?? event.httpMethod;
  if (method && method !== "POST") {
    return response(405, { error: "Method not allowed. Use POST." });
  }

  try {
    // API Gateway passes body as a string (possibly base64 encoded)
    let rawBody = event.body;
    if (event.isBase64Encoded && typeof rawBody === "string") {
      rawBody = Buffer.from(rawBody, "base64").toString("utf-8");
    }

    const { to, subject, body, templateName, replacements } =
      typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody ?? {};

    // Validate required fields
    if (!to || !subject) {
      return response(400, {
        error: "Missing required fields: 'to' and 'subject' are required",
      });
    }

    let emailBody = body;

    // If templateName is provided, use template
    if (templateName) {
      try {
        emailBody = getTemplate(templateName, replacements || {});
      } catch (error) {
        return response(400, { error: `Template error: ${error.message}` });
      }
    }

    // Validate that we have email body
    if (!emailBody) {
      return response(400, {
        error: "Either 'body' or 'templateName' must be provided",
      });
    }

    // Send the email
    const info = await sendMail({
      to,
      subject,
      body: emailBody,
      consoleMessage: `Email sent to ${to}`,
    });

    return response(200, {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error in sendMail Lambda handler:", error);
    return response(500, {
      error: "Failed to send email",
      message: error.message,
    });
  }
}

export default handler;

