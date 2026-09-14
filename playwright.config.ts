import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: {
    baseURL: 'http://127.0.0.1:4322/recipes/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run build && node scripts/preview-tests.mjs',
    env: { BASE_PATH: '/recipes/' },
    url: 'http://127.0.0.1:4322/recipes/',
    reuseExistingServer: false,
  },
});
