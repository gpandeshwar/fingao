import { defineFunction } from "@aws-amplify/backend";

export const getTickerHoldings = defineFunction({
  name: "get-ticker-holdings",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    TICKER_HOLDINGS_TABLE: "StockResearchAgent-tickerHoldings",
  },
});
