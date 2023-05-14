import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    coverage: {
      all: true,
      reporter: ["text", "json", "html"],
      include: ["src"],
    },
    threads: false,
    exclude: [...configDefaults.exclude, "tests/e2e"],
  },
  resolve: {
    alias: [{ find: "src", replacement: resolve(__dirname, "./src") }],
  },
});
