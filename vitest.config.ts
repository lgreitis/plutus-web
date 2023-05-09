import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

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
  },
  resolve: {
    alias: [{ find: "src", replacement: resolve(__dirname, "./src") }],
  },
});
