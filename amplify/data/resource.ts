import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { extractPortfolio } from "../functions/extract-portfolio/resource.js";
import { getTickerHoldings } from "../functions/get-ticker-holdings/resource.js";

const schema = a.schema({
  Portfolio: a
    .model({
      ticker: a.string().required(),
      shares: a.float().required(),
      costBasis: a.float().required(),
      currentValue: a.float().required(),
      purchaseDate: a.date().required(),
      parentTicker: a.string(),
      tickerType: a.string(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Watchlist: a
    .model({
      ticker: a.string().required(),
      targetPrice: a.float(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Transaction: a
    .model({
      type: a.enum(["BUY", "SELL", "DIVIDEND"]),
      ticker: a.string().required(),
      shares: a.float().required(),
      price: a.float().required(),
      date: a.date().required(),
      accountType: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  // Custom query to extract portfolio from uploaded file
  ExtractedHolding: a
    .model({
      userId: a.string().required(),
      ticker: a.string().required(),
      shares: a.float().required(),
      costBasis: a.float().required(),
      currentValue: a.float().required(),
      purchaseDate: a.string(),
      tickerType: a.string(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  // Return type for the extraction query
  ExtractedHoldingResult: a.customType({
    ticker: a.string().required(),
    shares: a.float().required(),
    costBasis: a.float().required(),
    currentValue: a.float().required(),
    purchaseDate: a.string(),
    tickerType: a.string(),
    notes: a.string(),
  }),

  ExtractionResult: a.customType({
    success: a.boolean().required(),
    holdings: a.ref("ExtractedHoldingResult").required().array(),
    summary: a.string(),
    error: a.string(),
  }),

  extractPortfolioFromFile: a
    .query()
    .arguments({
      bucket: a.string().required(),
      key: a.string().required(),
    })
    .returns(a.ref("ExtractionResult"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(extractPortfolio)),

  // Underlying holdings lookup
  UnderlyingHoldingItem: a.customType({
    ticker: a.string().required(),
    weight: a.float().required(),
    name: a.string(),
  }),

  TickerHoldingsResult: a.customType({
    ticker: a.string().required(),
    holdings: a.ref("UnderlyingHoldingItem").required().array(),
    lastUpdated: a.string(),
    found: a.boolean().required(),
    dividendYield: a.float(),
  }),

  getTickerHoldings: a
    .query()
    .arguments({
      ticker: a.string().required(),
    })
    .returns(a.ref("TickerHoldingsResult"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getTickerHoldings)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
