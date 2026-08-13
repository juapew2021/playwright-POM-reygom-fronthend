import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LeadsPage } from '../pages/LeadsPage';

/**
 * Fixture que extiende el `test` base de Playwright para inyectar
 * los Page Objects ya instanciados. Asi los specs no hacen
 * `new LoginPage(page)` en cada test: piden `loginPage` como parametro
 * y Playwright se encarga del ciclo de vida.
 */
type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  leadsPage: LeadsPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  leadsPage: async ({ page }, use) => {
    await use(new LeadsPage(page));
  },
});

export { expect } from '@playwright/test';
