import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./specs/openapi.yaml",
  output: {
    path: "generated/typescript",
    clean: true,
  },
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    "@hey-api/client-fetch",
  ],
});
