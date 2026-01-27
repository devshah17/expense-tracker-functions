# Expense Tracker Functions

A serverless functions repository for hosting multiple Google Cloud Functions for the Expense Tracker application.

## Architecture

This repository uses a modular structure where each function is organized in its own directory under `functions/`. Each function can be deployed independently to Google Cloud Functions.

```
expense-tracker-functions/
├── functions/
│   └── sendMail/              # Email sending function
│       ├── index.js           # Cloud Function HTTP handler
│       ├── sendMail.js        # Core email logic
│       └── templates/         # Email HTML templates
│           ├── OTP.html
│           └── SignUp.html
├── index.js                   # Main entry point (exports all functions)
├── package.json
├── .gcloudignore
└── .env.yaml.example          # Example environment configuration
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

For local development, create a `.env` file:

```bash
cp .env.yaml.example .env
```

Edit `.env` and add your credentials:

```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

For Google Cloud deployment, create a `.env.yaml` file:

```bash
cp .env.yaml.example .env.yaml
```

Edit `.env.yaml` with your actual credentials.

### 3. Test Locally

Start the Functions Framework locally:

```bash
npm start
```

The function will be available at `http://localhost:8080`

## Available Functions

### SendMail

Sends emails via Gmail SMTP with support for HTML templates.

**Endpoint:** `/sendMail` (POST)

**Request Body:**

```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "<h1>HTML content</h1>",
  "templateName": "OTP",
  "replacements": {
    "name": "John",
    "otp": "123456"
  }
}
```

**Parameters:**

- `to` (required): Recipient email address
- `subject` (required): Email subject
- `body` (optional): HTML email body
- `templateName` (optional): Template name (e.g., 'OTP', 'SignUp')
- `replacements` (optional): Object with key-value pairs for template placeholders

**Example with cURL:**

```bash
# Send with direct HTML body
curl -X POST http://localhost:8080/sendMail \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "<h1>Hello World</h1>"
  }'

# Send with template
curl -X POST http://localhost:8080/sendMail \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "OTP Verification",
    "templateName": "OTP",
    "replacements": {
      "name": "John Doe",
      "otp": "123456"
    }
  }'
```

## Deployment

### Prerequisites

1. Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
2. Authenticate: `gcloud auth login`
3. Set your project: `gcloud config set project YOUR_PROJECT_ID`

### Deploy SendMail Function

```bash
npm run deploy:sendMail
```

Or manually:

```bash
gcloud functions deploy sendMail \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --source=functions/sendMail \
  --entry-point=sendMail \
  --env-vars-file=.env.yaml
```

After deployment, you'll receive a URL like:

```
https://REGION-PROJECT_ID.cloudfunctions.net/sendMail
```

## Adding New Functions

1. Create a new directory under `functions/`: `functions/yourFunction/`
2. Create `index.js` with your Cloud Function handler
3. Add any supporting files
4. Export the function in the main `index.js`
5. Add a deployment script to `package.json`

**Example:**

```javascript
// functions/yourFunction/index.js
import functions from "@google-cloud/functions-framework";

functions.http("yourFunction", async (req, res) => {
  res.json({ message: "Hello from yourFunction!" });
});
```

```json
// package.json - add script
"deploy:yourFunction": "gcloud functions deploy yourFunction --runtime nodejs20 --trigger-http --source=functions/yourFunction --entry-point=yourFunction"
```

## Environment Variables

Set environment variables in Google Cloud Functions:

**Option 1: Using .env.yaml (recommended)**

Create `.env.yaml` and deploy with `--env-vars-file=.env.yaml`

**Option 2: Using Cloud Console**

Set environment variables in the Google Cloud Console under the function's configuration.

**Option 3: Using gcloud CLI**

```bash
gcloud functions deploy sendMail \
  --set-env-vars GMAIL_USER=your-email@gmail.com,GMAIL_PASS=your-app-password
```

## License

ISC
