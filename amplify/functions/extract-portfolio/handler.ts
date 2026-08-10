import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { Readable } from "stream";

const s3 = new S3Client({});
const bedrock = new BedrockRuntimeClient({});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || "us.anthropic.claude-sonnet-4-20250514-v1:0";

interface S3ObjectEvent {
  bucket: string;
  key: string;
  userId?: string;
}

// AppSync resolver event wraps arguments
interface AppSyncEvent {
  arguments?: {
    bucket: string;
    key: string;
  };
  identity?: {
    username?: string;
    sub?: string;
  };
  // Direct invocation format
  bucket?: string;
  key?: string;
  userId?: string;
}

interface ExtractedHolding {
  ticker: string;
  shares: number;
  costBasis: number;
  currentValue: number;
  purchaseDate?: string;
  tickerType?: string;
  notes?: string;
}

interface ExtractionResult {
  success: boolean;
  holdings: ExtractedHolding[];
  summary?: string;
  rawText?: string;
  error?: string;
}

const EXTRACTION_PROMPT = `You are a financial document parser. Analyze the following document content and extract all investment holdings.

For each holding, extract:
- ticker: The stock/ETF/fund ticker symbol (e.g., AAPL, MSFT, VTI, VFIAX). For cash positions (money market, sweep accounts, uninvested cash), use "CASH" as the ticker.
- shares: Number of shares held (numeric). For cash positions, use 1.
- costBasis: Average cost per share in USD (numeric). For cash positions, use the cash balance amount.
- currentValue: Current market value per share in USD (numeric). If not shown in the document, use the cost basis as a fallback. For cash positions, use the cash balance amount.
- purchaseDate: Date of purchase if available (YYYY-MM-DD format)
- tickerType: The type of investment instrument. Must be one of: "Stock", "ETF", "MutualFund", or "Cash". Classify based on the ticker:
  - "Stock" for individual company stocks (AAPL, MSFT, GOOGL, etc.)
  - "ETF" for exchange traded funds (VTI, SPY, QQQ, SCHD, etc.) — also classify as "ETF" if the description contains "exchange traded fund", "exchange traded fund", "exchange tr fd" or "ETF"
  - "MutualFund" for mutual funds (VFIAX, FXAIX, etc. — typically 5 letters ending in X)
  - "Cash" for money market funds, sweep accounts, or any cash/uninvested positions. The ticker MUST be "CASH" and tickerType MUST be "Cash".
- notes: Any relevant notes about the position

Return ONLY valid JSON in this exact format:
{
  "holdings": [
    {
      "ticker": "AAPL",
      "shares": 50,
      "costBasis": 142.50,
      "currentValue": 185.25,
      "purchaseDate": "2023-03-15",
      "tickerType": "Stock",
      "notes": ""
    },
    {
      "ticker": "CASH",
      "shares": 1,
      "costBasis": 5000.00,
      "currentValue": 5000.00,
      "purchaseDate": "",
      "tickerType": "Cash",
      "notes": "Uninvested cash"
    }
  ],
  "summary": "Brief summary of what was found in the document"
}

If you cannot find any holdings, return:
{
  "holdings": [],
  "summary": "No investment holdings found in this document"
}

Document content:
`;

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function getMediaType(key: string): string {
  const ext = key.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "text/plain";
  }
}

function isImageType(mediaType: string): boolean {
  return mediaType.startsWith("image/");
}

function isPdfType(mediaType: string): boolean {
  return mediaType === "application/pdf";
}

async function extractWithTextContent(
  textContent: string
): Promise<ExtractionResult> {
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: EXTRACTION_PROMPT + textContent,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await bedrock.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const assistantMessage = responseBody.content[0].text;

  // Parse the JSON from the response
  const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      success: false,
      holdings: [],
      error: "Could not parse structured data from AI response",
      rawText: assistantMessage,
    };
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    success: true,
    holdings: parsed.holdings || [],
    summary: parsed.summary,
  };
}

async function extractWithImageContent(
  imageBuffer: Buffer,
  mediaType: string
): Promise<ExtractionResult> {
  const base64Image = imageBuffer.toString("base64");

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await bedrock.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const assistantMessage = responseBody.content[0].text;

  const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      success: false,
      holdings: [],
      error: "Could not parse structured data from AI response",
      rawText: assistantMessage,
    };
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    success: true,
    holdings: parsed.holdings || [],
    summary: parsed.summary,
  };
}

async function extractWithDocumentContent(
  docBuffer: Buffer,
  mediaType: string
): Promise<ExtractionResult> {
  const base64Doc = docBuffer.toString("base64");

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Doc,
            },
          },
          {
            type: "text",
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await bedrock.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const assistantMessage = responseBody.content[0].text;

  const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      success: false,
      holdings: [],
      error: "Could not parse structured data from AI response",
      rawText: assistantMessage,
    };
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    success: true,
    holdings: parsed.holdings || [],
    summary: parsed.summary,
  };
}

export const handler = async (event: AppSyncEvent): Promise<ExtractionResult> => {
  console.log("Processing event:", JSON.stringify(event));

  // Support both AppSync resolver and direct invocation formats
  const bucket = event.arguments?.bucket || event.bucket;
  const key = event.arguments?.key || event.key;
  const userId = event.identity?.sub || event.userId;

  if (!bucket || !key) {
    return {
      success: false,
      holdings: [],
      error: "Missing required fields: bucket and key",
    };
  }

  try {
    // Fetch the object from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const s3Response = await s3.send(getObjectCommand);

    if (!s3Response.Body) {
      return {
        success: false,
        holdings: [],
        error: "Empty file received from S3",
      };
    }

    const fileBuffer = await streamToBuffer(s3Response.Body as Readable);
    const mediaType = getMediaType(key);

    console.log(`File size: ${fileBuffer.length} bytes, type: ${mediaType}`);

    let result: ExtractionResult;

    if (isImageType(mediaType)) {
      // Use vision capabilities for images
      result = await extractWithImageContent(fileBuffer, mediaType);
    } else if (isPdfType(mediaType)) {
      // Use document capabilities for PDFs
      result = await extractWithDocumentContent(fileBuffer, mediaType);
    } else {
      // Treat as text (CSV, TXT, etc.)
      const textContent = fileBuffer.toString("utf-8");
      result = await extractWithTextContent(textContent);
    }

    console.log(
      `Extraction complete: ${result.holdings.length} holdings found`
    );

    // Add userId to response if provided
    if (userId) {
      (result as any).userId = userId;
    }

    return result;
  } catch (error: any) {
    console.error("Extraction error:", error);
    return {
      success: false,
      holdings: [],
      error: `Extraction failed: ${error.message}`,
    };
  }
};
