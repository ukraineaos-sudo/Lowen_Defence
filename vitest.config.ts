import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["Tests/**/*.test.ts"],
    reporters: ["default", "json", "verbose"],
    outputFile: {
      json: "Tests/results/vitest-report.json",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
