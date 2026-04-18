import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(__dirname, "app"),
    },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.ts", "app/**/*.test.tsx"],
    globals: false,
  },
});
