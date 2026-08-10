import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";
import { storage } from "./storage/resource.js";
import { extractPortfolio } from "./functions/extract-portfolio/resource.js";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
  storage,
  extractPortfolio,
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
