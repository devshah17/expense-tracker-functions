import functions from "@google-cloud/functions-framework";
import { sendMail, getTemplate } from "./sendMail.js";

/**
 * HTTP Cloud Function for sending emails
 * Accepts POST requests with email parameters
 *
 * Request body:
 * {
 *   "to": "recipient@example.com",           // Required
 *   "subject": "Email Subject",              // Required
 *   "body": "<h1>HTML content</h1>",         // Optional if templateName provided
 *   "templateName": "OTP",                   // Optional (e.g., 'OTP', 'SignUp')
 *   "replacements": {"name": "John", "otp": "123456"}  // Optional, for template
 * }
 */
functions.http("sendMail", async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const { to, subject, body, templateName, replacements } = req.body;

    // Validate required fields
    if (!to || !subject) {
      res.status(400).json({
        error: "Missing required fields: 'to' and 'subject' are required",
      });
      return;
    }

    let emailBody = body;

    // If templateName is provided, use template
    if (templateName) {
      try {
        emailBody = getTemplate(templateName, replacements || {});
      } catch (error) {
        res.status(400).json({
          error: `Template error: ${error.message}`,
        });
        return;
      }
    }

    // Validate that we have email body
    if (!emailBody) {
      res.status(400).json({
        error: "Either 'body' or 'templateName' must be provided",
      });
      return;
    }

    // Send the email
    const info = await sendMail({
      to,
      subject,
      body: emailBody,
      consoleMessage: `Email sent to ${to}`,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error in sendMail function:", error);
    res.status(500).json({
      error: "Failed to send email",
      message: error.message,
    });
  }
});
