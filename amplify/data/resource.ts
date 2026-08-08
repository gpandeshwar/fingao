import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Portfolio: a
    .model({
      ticker: a.string().required(),
      shares: a.float().required(),
      costBasis: a.float().required(),
      purchaseDate: a.date().required(),
      parentTicker: a.string(),
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
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
