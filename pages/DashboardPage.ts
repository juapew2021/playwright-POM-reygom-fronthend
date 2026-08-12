import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object del dashboard del CRM (/dashboard) tras autenticarse.
 *
 * Selectores verificados con el trace de una corrida real (ago-2026).
 * `pageHeading` con `page.locator('h1')` fallaba en modo estricto porque
 * la app tiene DOS h1: el logo "ReyGom CRM" en el sidebar y el titulo
 * "Dashboard" del contenido — hay que apuntar al texto exacto para
 * desambiguar. El sidebar tampoco tiene un menu de usuario separado: el
 * boton "Cerrar sesión" esta siempre visible, sin un trigger previo.
 */
export class DashboardPage extends BasePage {
  readonly logoutButton: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = page.getByRole('button', { name: /cerrar sesi[oó]n|logout|sign out/i });
    this.pageHeading = page.getByRole('heading', { name: 'Dashboard', exact: true });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  async isLoaded(): Promise<boolean> {
    return this.pageHeading.isVisible();
  }
}
