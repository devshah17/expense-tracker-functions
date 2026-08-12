# Expense Tracker Functions

A serverless functions repository hosting multiple AWS Lambda functions for the Expense Tracker application. Deployment is automated via GitHub Actions on every push to `main`.

## Architecture

Each function lives in its own directory under `functions/` and is deployed as an independent Lambda function fronted by AWS API Gateway.

```
expense-tracker-functions/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions — deploys to AWS Lambda on push to main
├── functions/
│   └── sendMail/               # Email sending Lambda
│       ├── index.js            # Lambda handler (exports `handler`)
│       ├── sendMail.js         # Core email logic (nodemailer)
│       └── templates/          # Email HTML templates
│           ├── OTP.html
│           └── SignUp.html
├── index.js                    # Re-exports all Lambda handlers
├── server.js                   # Local Express dev server (not used in Lambda)
├── package.json
└── .env.example                # Example environment configuration
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file for local development:

```bash
cp .env.example .env
```

Add your credentials:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-specific-password
```

### 3. Run Locally

```bash
npm run dev      # nodemon with auto-reload
# or
npm start        # plain node
```

The dev server wraps the Lambda handlers in Express and is available at `http://localhost:8080`.

---

## Available Functions

### sendMail

Sends transactional emails via Gmail SMTP with HTML template support.

**Lambda Handler:** `functions/sendMail/index.js` → `handler`

**Endpoint (via API Gateway):** `POST /sendMail`

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

| Field           | Required | Description                                      |
|-----------------|----------|--------------------------------------------------|
| `to`            | ✅       | Recipient email address                          |
| `subject`       | ✅       | Email subject line                               |
| `body`          | ⬜       | Raw HTML body (use if `templateName` not given)  |
| `templateName`  | ⬜       | Template name (e.g. `OTP`, `SignUp`)             |
| `replacements`  | ⬜       | Key-value pairs for `{{placeholder}}` in template|

**Example with cURL (local):**

```bash
# Direct HTML body
curl -X POST http://localhost:8080/sendMail \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Hello","body":"<h1>Hi!</h1>"}'

# With template
curl -X POST http://localhost:8080/sendMail \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Your OTP","templateName":"OTP","replacements":{"name":"John","otp":"123456"}}'
```

---

## Deployment

Deployment is **fully automated** via GitHub Actions. Push to `main` → Lambda is updated.

### Prerequisites

1. An AWS Lambda function named **`sendMail`** (Runtime: Node.js 20.x, Handler: `index.handler`)
2. An AWS API Gateway (HTTP API or REST API) linked to the Lambda function
3. The following **GitHub repository secrets** configured:

| Secret                  | Description                              |
|-------------------------|------------------------------------------|
| `AWS_ACCESS_KEY_ID`     | IAM user access key with Lambda permissions |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key                      |
| `AWS_REGION`            | AWS region (e.g. `us-east-1`)            |
| `GMAIL_USER`            | Gmail address used for sending           |
| `GMAIL_PASS`            | Gmail app-specific password              |

### Required IAM Permissions

The IAM user used by GitHub Actions needs at minimum:

```json
{
  "Effect": "Allow",
  "Action": [
    "lambda:UpdateFunctionCode",
    "lambda:UpdateFunctionConfiguration",
    "lambda:GetFunctionConfiguration"
  ],
  "Resource": "arn:aws:lambda:<region>:<account-id>:function:sendMail"
}
```

### First-time Lambda Setup

If the Lambda function does not exist yet, create it once via the AWS Console or CLI:

```bash
# Create the function (first time only)
aws lambda create-function \
  --function-name sendMail \
  --runtime nodejs20.x \
  --handler index.handler \
  --role arn:aws:iam::<account-id>:role/<lambda-execution-role> \
  --zip-file fileb://sendMail.zip \
  --environment "Variables={GMAIL_USER=you@gmail.com,GMAIL_PASS=yourpass}"
```

After the first deploy, all subsequent updates are handled automatically by GitHub Actions.

---

## Adding New Functions

1. Create `functions/yourFunction/index.js` exporting a `handler`:

```javascript
// functions/yourFunction/index.js
export async function handler(event) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello from yourFunction!" }),
  };
}
```

2. Re-export it in the root `index.js`:

```javascript
export { handler as yourFunction } from "./functions/yourFunction/index.js";
```

3. Add a route to `server.js` for local dev.

4. Add a new job in `.github/workflows/deploy.yml` to deploy the new Lambda.

---

## Environment Variables

Environment variables are injected into Lambda at deploy time by the GitHub Actions workflow using `aws lambda update-function-configuration`.

For local development, use a `.env` file loaded by `dotenv` via `server.js`.

---

## License

ISC
