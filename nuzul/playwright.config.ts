import { defineConfig } from '@playwright/test';

// Smoke E2E. Requires browsers (`npx playwright install chromium`) and a running
// dev/start server with a seeded DB. CI runs unit tests only by default.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    locale: 'ar',
  },
});
