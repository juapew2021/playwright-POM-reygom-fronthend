import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Fixture que extiende el `test` base de Playwright para inyectar
 * los Page Objects ya instanciados. Asi los specs no hacen
 * `new LoginPage(page)` en cada test: piden `loginPage` como parametro
 * y Playwright se encarga del ciclo de vida.
 */
type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
