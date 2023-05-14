import { devices, type PlaywrightTestConfig } from "@playwright/test";
import path from "node:path";

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

const options = {
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
};

const outputDir = path.join(__dirname, "test-results");

const config: PlaywrightTestConfig = {
  testDir: "./tests/e2e",
  globalSetup: "./tests/utils/global.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  workers: 1,
  use: {
    storageState: "./tests/utils/storage-state.json",
    baseURL: baseUrl,
    headless: options.headless,
  },
  outputDir: path.join(outputDir, "results"),
  reporter: [
    [
      "html",
      {
        outputFolder: "./test-results/reports/playwright-html-report",
        open: "never",
      },
    ],
  ],
};

export default config;
