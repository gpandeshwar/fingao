import { defineFunction } from "@aws-amplify/backend";

export const extractPortfolio = defineFunction({
  name: "extract-portfolio",
  entry: "./handler.ts",
  timeoutSeconds: 120,
  memoryMB: 512,
  environment: {
    BEDROCK_MODEL_ID: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
  },
});
