import { defineFunction } from "@aws-amplify/backend";

export const researchTickers = defineFunction({
  name: "research-tickers",
  entry: "./handler.ts",
  timeoutSeconds: 900,
  memoryMB: 512,
  environment: {
    TICKER_HOLDINGS_TABLE: "StockResearchAgent-tickerHoldings",
    AGENT_RUNTIME_ARN: "arn:aws:bedrock-agentcore:us-east-2:726299224250:runtime/StockResearchAgent_StockResearchAgent-oL4zl8E6r0",
  },
});
