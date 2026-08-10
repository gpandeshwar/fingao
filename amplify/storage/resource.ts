import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "fingao-portfolioUploads",
  access: (allow) => ({
    "uploads/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
});
