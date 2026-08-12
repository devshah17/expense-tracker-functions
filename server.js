/**
 * Local development server
 * Wraps Lambda handlers in an Express server so they can be tested at localhost:8080.
 * NOT used in production — Lambda handles requests directly in AWS.
 */

import "dotenv/config";
import express from "express";
import { handler as sendMailHandler } from "./functions/sendMail/index.js";

const app = express();
app.use(express.json());

/**
 * Converts an Express request into an API Gateway v2 HTTP API proxy event
 * so that the Lambda handler can be called directly in local dev.
 */
function toApiGatewayEvent(req) {
  return {
    requestContext: {
      http: {
        method: req.method,
      },
    },
    headers: req.headers,
    body: JSON.stringify(req.body),
    isBase64Encoded: false,
  };
}

// Route: POST /sendMail
app.all("/sendMail", async (req, res) => {
  const event = toApiGatewayEvent(req);
  const result = await sendMailHandler(event);
  res
    .status(result.statusCode)
    .set(result.headers || {})
    .send(result.body);
});

// Health check
app.get("/", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
