import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LeadsPage extends BasePage {
  readonly newLeadButton: Locator;
  readonly leadsTable: Locator;
  readonly searchInput: Locator;
  readonly nameInput: Locator;        // ← nuevo
  readonly emailInput: Locator;       // ← nuevo
  readonly saveLeadButton: Locator;   // ← nuevo

  constructor(page: Page) {
    super(page);
    this.newLeadButton = page.getByRole('button', { name: /nuevo|crear|add lead|nuevo prospecto|nuevo lead/i });
    this.leadsTable = page.locator('table').first();
    this.searchInput = page.getByPlaceholder('Buscar');
    this.nameInput = page.getByPlaceholder('Nombre');
    this.emailInput = page.getByPlaceholder('Email');
    this.saveLeadButton = page.getByRole('button', { name: /guardar|crear|save/i });
  }

  async open(): Promise<void> {
    await this.goto('/leads');
    await this.page.waitForLoadState('networkidle');
  }

  async createLead(name: string, email: string, phone?: string): Promise<void> {
    await this.newLeadButton.click();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    if (phone) {
      // algunos forms usan placeholder "Teléfono" o "Telefono"
      const phoneInput = this.page.getByPlaceholder(/Tel[eé]fono|Telefono|Phone/i);
      if (await phoneInput.count()) {
        await phoneInput.fill(phone);
      }
    }
    await this.saveLeadButton.click();
  }

  async isLoaded(): Promise<boolean> {
    try {
      // Prefer table visibility, fallback to a heading that mentions leads/prospectos
      if (await this.leadsTable.isVisible()) return true;
    } catch {
      // ignore
    }

    const headingCount = await this.page.getByRole('heading', { name: /lead|prospect/i }).count();
    if (headingCount > 0) return true;

    // fallback: check current URL contains /leads
    try {
      return /\/leads/.test(this.page.url());
    } catch {
      return false;
    }
  }
  
  async expectLeadVisible(name: string): Promise<void> {
    const locator = this.page.getByText(name).first();
    await locator.waitFor({ state: 'visible', timeout: 5000 });
  }

  async expectLeadNotVisible(name: string): Promise<void> {
    const locator = this.page.getByText(name).first();
    await expect(locator).not.toBeVisible({ timeout: 3000 });
  }
}