import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  BedrockAgentCoreClient,
  InvokeAgentRuntimeCommand,
} from "@aws-sdk/client-bedrock-agentcore";

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const agentCoreClient = new BedrockAgentCoreClient({});

const TICKER_HOLDINGS_TABLE = process.env.TICKER_HOLDINGS_TABLE || "";
const AGENT_RUNTIME_ARN = process.env.AGENT_RUNTIME_ARN || "";
const STALE_HOURS = 72;

interface ResearchTickersEvent {
  tickers: string[];
  arguments?: { tickers: string[] };
}

interface ResearchResult {
  success: boolean;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
  details: { ticker: string; status: "updated" | "skipped" | "error"; message?: string }[];
}

function isStale(lastUpdated: string | undefined): boolean {
  if (!lastUpdated) return true;
  const hoursElapsed = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
  return hoursElapsed >= STALE_HOURS;
}

async function isTickerFresh(ticker: string): Promise<boolean> {
  try {
    const result = await ddbClient.send(
      new GetCommand({
        TableName: TICKER_HOLDINGS_TABLE,
        Key: { ticker: ticker.toUpperCase() },
        ProjectionExpression: "lastUpdated",
      })
    );
    return result.Item ? !isStale(result.Item.lastUpdated) : false;
  } catch {
    return false;
  }
}

async function invokeAgent(ticker: string): Promise<void> {
  const prompt = `Find the composition and relevant metadata for the stock ticker: ${ticker}`;
  const payload = new TextEncoder().encode(JSON.stringify({ prompt }));

  const command = new InvokeAgentRuntimeCommand({
    agentRuntimeArn: AGENT_RUNTIME_ARN,
    payload,
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await agentCoreClient.send(command);

  // Consume the stream to completion (agent handles its own DDB writes)
  if (response.response) {
    await response.response.transformToByteArray();
  }
}

export const handler = async (event: ResearchTickersEvent): Promise<ResearchResult> => {
  const tickers = event.arguments?.tickers || event.tickers || [];

  if (!tickers.length) {
    return { success: false, updatedCount: 0, skippedCount: 0, errors: ["No tickers provided"], details: [] };
  }

  const result: ResearchResult = { success: true, updatedCount: 0, skippedCount: 0, errors: [], details: [] };

  for (const ticker of tickers) {
    const upper = ticker.toUpperCase();

    try {
      // Skip if data is fresh (updated within 72h)
      if (TICKER_HOLDINGS_TABLE && await isTickerFresh(upper)) {
        result.skippedCount++;
        result.details.push({ ticker: upper, status: "skipped", message: "Data is fresh" });
        continue;
      }

      // Invoke agent — it handles research and writes to DDB on its own
      await invokeAgent(upper);

      // Mark this ticker as freshly updated
      if (TICKER_HOLDINGS_TABLE) {
        await ddbClient.send(
          new UpdateCommand({
            TableName: TICKER_HOLDINGS_TABLE,
            Key: { ticker: upper },
            UpdateExpression: "SET lastUpdated = :ts",
            ExpressionAttributeValues: { ":ts": new Date().toISOString() },
          })
        );
      }

      result.updatedCount++;
      result.details.push({ ticker: upper, status: "updated", message: "Agent invoked successfully" });
    } catch (err: any) {
      result.errors.push(`${upper}: ${err.message}`);
      result.details.push({ ticker: upper, status: "error", message: err.message });
    }
  }

  result.success = result.errors.length === 0;
  return result;
};
