/**
 * Main entry point for Google Cloud Functions
 * Each function is deployed independently but can be exported here for reference
 *
 * To deploy a function:
 * npm run deploy:sendMail
 *
 * To test locally:
 * npm start
 */

// Export all functions here as they are added
// Currently only sendMail is implemented
// Import and re-export when adding more functions

import "./functions/sendMail/index.js";
