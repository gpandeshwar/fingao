import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";
import { storage } from "./storage/resource.js";
import { extractPortfolio } from "./functions/extract-portfolio/resource.js";
import { researchTickers } from "./functions/research-tickers/resource.js";
import { getTickerHoldings } from "./functions/get-ticker-holdings/resource.js";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
  storage,
  extractPortfolio,
  researchTickers,
  getTickerHoldings,
});

// Grant the extract-portfolio function permissions to:
// 1. Read from S3 (the storage bucket)
// 2. Invoke Bedrock models
const extractFn = backend.extractPortfolio.resources.lambda;

extractFn.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["s3:GetObject", "s3:HeadObject", "s3:ListBucket"],
    resources: ["arn:aws:s3:::*", "arn:aws:s3:::*/*"],
  })
);

extractFn.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      "arn:aws:bedrock:*::foundation-model/anthropic.*",
      "arn:aws:bedrock:*:*:inference-profile/us.anthropic.*",
      "arn:aws:bedrock:*:*:inference-profile/global.anthropic.*",
    ],
  })
);

// Grant the research-tickers function permissions to:
// 1. Read/write to DynamoDB (ticker_holdings table)
// 2. Invoke Bedrock Agents
const researchFn = backend.researchTickers.resources.lambda;

researchFn.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:Query",
    ],
    resources: ["arn:aws:dynamodb:*:*:table/*"],
  })
);

researchFn.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      "bedrock-agentcore:InvokeAgentRuntime",
    ],
    resources: ["arn:aws:bedrock-agentcore:*:*:runtime/*"],
  })
);

// Grant the get-ticker-holdings function read access to DynamoDB
const getTickerFn = backend.getTickerHoldings.resources.lambda;

getTickerFn.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["dynamodb:GetItem", "dynamodb:Query"],
    resources: ["arn:aws:dynamodb:*:*:table/*"],
  })
);
