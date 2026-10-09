import {defineConfig, devices} from '@playwright/test'

/**
 * E2E, layout, accessibility and SEO tests against the production build (`next build` first).
 * The site runs on local fixtures; the lead webhook goes to a mock receiver and email uses
 * nodemailer's JSON transport (nothing is sent).
 */
const PORT = 3100
const WEBHOOK_PORT = 4010

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', {open: 'never'}]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {name: 'desktop', use: {...devices['Desktop Chrome'], viewport: {width: 1280, height: 900}}},
    {name: 'mobile', use: {...devices['Pixel 7']}, testMatch: /(navigation|quote)\.spec\.ts/},
  ],
  webServer: [
    {
      command: `node tests/e2e/mock-webhook.mjs ${WEBHOOK_PORT}`,
      port: WEBHOOK_PORT,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npx next start -p ${PORT}`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
      env: {
        SITE_ENV: 'test',
        NEXT_PUBLIC_SITE_URL: 'https://www.iimtechnicalservices.com',
        LEAD_WEBHOOK_URL: `http://localhost:${WEBHOOK_PORT}/hook`,
        LEAD_WEBHOOK_SECRET: 'e2e-secret',
        OWNER_EMAIL: 'owner@example.com',
      },
    },
  ],
})
