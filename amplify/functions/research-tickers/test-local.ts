/**
 * Local test for the research-tickers Lambda.
 *
 * Prerequisites:
 * 1. AWS credentials configured
 * 2. Set environment variables:
 *    - TICKER_HOLDINGS_TABLE: DynamoDB table name
 *    - AGENT_ID: Bedrock Agent ID
 *    - AGENT_ALIAS_ID: Bedrock Agent Alias ID
 *
 * Usage:
 *   TICKER_HOLDINGS_TABLE=ticker_holdings AGENT_ID=ABC123 AGENT_ALIAS_ID=XYZ789 \
 *     npx tsx amplify/functions/research-tickers/test-local.ts
 */

import { handler } from "./handler.js";

const testEvent = {
  tickers: ["AAPL", "VTI", "MSFT"],
};

async function main() {
  console.log("🚀 Testing research-tickers Lambda\n");
  console.log("Event:", JSON.stringify(testEvent, null, 2));
  console.log("---\n");

  const result = await handler(testEvent);
  console.log("\n📊 Result:\n");
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
