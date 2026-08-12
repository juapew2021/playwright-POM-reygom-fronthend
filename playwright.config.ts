import dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

/**
 * Configuracion central de Playwright.
 *
 * Ambientes: el archivo de variables se elige con TEST_ENV (dev por
 * defecto). Cada ambiente vive en su propio .env.<nombre>, gitignored,
 * con su propio BASE_URL y credenciales:
 *   TEST_ENV=dev  -> .env.dev  -> https://crm-dev.reygom.com
 *   TEST_ENV=prod -> .env.prod -> https://crm.reygom.com
 *
 * Usa los scripts npm run test:dev / npm run test:prod en vez de setear
 * TEST_ENV a mano (ver package.json).
 */
const env = process.env.TEST_ENV ?? 'dev';
dotenv.config({ path: `.env.${env}` });

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://crm-dev.reygom.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
