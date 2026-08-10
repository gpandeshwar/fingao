/**
 * Mock test — bypasses S3 and feeds content directly to the extraction logic.
 * Tests the Bedrock AI extraction without needing a real S3 bucket.
 *
 * Prerequisites:
 * 1. AWS credentials configured (for Bedrock access)
 * 2. Bedrock Claude model access enabled in your region
 *
 * Usage:
 *   npx tsx amplify/functions/extract-portfolio/test-mock.ts
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({});
const MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0";

// Sample CSV content simulating a brokerage export
const sampleCSV = `Symbol,Description,Quantity,Cost Basis Per Share,Purchase Date,Account
AAPL,Apple Inc.,50,142.50,2023-03-15,Brokerage
MSFT,Microsoft Corporation,30,285.00,2023-05-20,IRA
GOOGL,Alphabet Inc. Class A,25,105.00,2023-07-10,Brokerage
NVDA,NVIDIA Corporation,20,220.00,2023-09-01,Brokerage
VTI,Vanguard Total Stock Market ETF,100,198.50,2022-01-15,401k
AMZN,Amazon.com Inc.,40,125.00,2023-01-08,Roth IRA
TSLA,Tesla Inc.,15,245.00,2024-01-15,Brokerage`;

// Sample plain text simulating a statement
const sampleStatement = `
Fidelity Brokerage Account Statement - Q4 2024

Holdings Summary:
- Apple (AAPL): 50 shares, avg cost $142.50, purchased March 2023
- Microsoft (MSFT): 30 shares, avg cost $285.00, purchased May 2023
- NVIDIA (NVDA): 20 shares, avg cost $220.00, purchased September 2023
- Amazon (AMZN): 40 shares at $125.00 avg cost
- Tesla (TSLA): 15 shares at $245.00 per share, bought Jan 2024

Total Portfolio Value: $125,430.50
`;

const EXTRACTION_PROMPT = `You are a financial document parser. Analyze the following document content and extract all investment holdings.

For each holding, extract:
- ticker: The stock/ETF ticker symbol (e.g., AAPL, MSFT, VTI)
- shares: Number of shares held (numeric)
- costBasis: Average cost per share in USD (numeric)
- purchaseDate: Date of purchase if available (YYYY-MM-DD format)
- accountType: Type of account if mentioned (Brokerage, IRA, 401k, Roth IRA)
- notes: Any relevant notes about the position

Return ONLY valid JSON in this exact format:
{
  "holdings": [
    {
      "ticker": "AAPL",
      "shares": 50,
      "costBasis": 142.50,
      "purchaseDate": "2023-03-15",
      "accountType": "Brokerage",
      "notes": ""
    }
  ],
  "summary": "Brief summary of what was found in the document"
}

Document content:
`;

async function testExtraction(label: string, content: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📄 Test: ${label}`);
  console.log(`${"=".repeat(60)}\n`);

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: EXTRACTION_PROMPT + content,
      },
    ],
  };

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const assistantMessage = responseBody.content[0].text;

    // Parse JSON from response
    const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("❌ Could not parse JSON from response:");
      console.log(assistantMessage);
      return;
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log("✅ Extraction successful!\n");
    console.log(`Summary: ${result.summary}\n`);
    console.log(`Holdings found: ${result.holdings.length}\n`);

    result.holdings.forEach((h: any, i: number) => {
      console.log(
        `  ${i + 1}. ${h.ticker} — ${h.shares} shares @ $${h.costBasis}` +
          (h.purchaseDate ? ` (${h.purchaseDate})` : "") +
          (h.accountType ? ` [${h.accountType}]` : "")
      );
    });

    console.log("\nFull JSON response:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.name === "AccessDeniedException") {
      console.error(
        "\n⚠️  You need to enable Claude model access in Amazon Bedrock."
      );
      console.error(
        "   Go to: AWS Console → Bedrock → Model access → Request access for Anthropic Claude"
      );
    }
  }
}

async function main() {
  console.log("🧪 Extract Portfolio — Mock Tests");
  console.log(`   Model: ${MODEL_ID}`);
  console.log(`   Region: ${process.env.AWS_REGION || "us-east-2"}`);

  // Test with CSV
  await testExtraction("CSV brokerage export", sampleCSV);

  // Test with plain text statement
  await testExtraction("Plain text statement", sampleStatement);
}

main();
