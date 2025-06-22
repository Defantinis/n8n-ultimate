import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'src/testing/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5678',
    trace: 'on-first-retry',
    headless: true,
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
}); 