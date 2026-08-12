/**
 * Main entry point — re-exports Lambda handlers for reference.
 * Each function is deployed as its own Lambda function.
 *
 * To run locally:
 *   npm run dev         (nodemon + Express dev server on port 8080)
 *
 * Deployment is handled automatically by GitHub Actions on push to main.
 */

// Re-export all Lambda handlers
export { handler as sendMail } from "./functions/sendMail/index.js";
