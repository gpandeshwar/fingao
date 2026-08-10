/**
 * Local test script for the extract-portfolio Lambda function.
 *
 * Prerequisites:
 * 1. AWS credentials configured (aws configure or env vars)
 * 2. An S3 bucket with a test file uploaded
 * 3. Bedrock Claude model access enabled in your region
 *
 * Usage:
 *   npx tsx amplify/functions/extract-portfolio/test-local.ts
 */

import { handler } from "./handler.js";

// --- Configure your test here ---
const testEvent = {
  bucket: "fingao-portfolio-images-data",
  key: "test-client/portfolio.png",
  userId: "test-user-123",
};

// Example: test with a CSV content directly (mock S3)
// To test without S3, you can temporarily modify handler.ts
// or upload a test file to S3 first.

async function main() {
  console.log("🚀 Testing extract-portfolio Lambda locally\n");
  console.log("Event:", JSON.stringify(testEvent, null, 2));
  console.log("---\n");

  try {
    const result = await handler(testEvent);
    console.log("✅ Result:\n");
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.holdings.length > 0) {
      console.log(`\n📊 Extracted ${result.holdings.length} holdings:`);
      result.holdings.forEach((h) => {
        console.log(`   ${h.ticker}: ${h.shares} shares @ $${h.costBasis}`);
      });
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

main();
