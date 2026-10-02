import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["tests/**/*.test.ts"],
    // Replaces the Prisma client with an in-memory Postgres (see tests/setup.ts).
    setupFiles: ["tests/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env: {
      OPENAI_API_KEY: "test-key", // OpenAI is always mocked in tests
    },
  },
});
