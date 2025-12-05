import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    env: {
      NEXT_PUBLIC_STACK_PROJECT_ID: "550e8400-e29b-41d4-a716-446655440000",
      STACK_SECRET_SERVER_KEY: "test-secret-key",
      NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: "test-client-key",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/postgres",
      GEMINI_API_KEY: "test-gemini-key",
      UPSTASH_REDIS_REST_URL: "https://test-redis.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "test-redis-token",
      UPSTASH_REDIS_URL: "redis://test-redis.upstash.io",
    },
  },
});
