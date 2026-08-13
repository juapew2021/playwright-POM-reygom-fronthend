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
    // Inicializar locators dependientes de la página
    this.confirmDeleteButton = page.getByRole('button', { name: /confirmar/i });
    this.cancelDeleteButton = page.getByRole('button', { name: /cancelar/i });
    this.deleteSuccessToast = page.getByText(/Lead eliminado correctamente/i);
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
    // Esperar que el toast de creación (si aparece) desaparezca para no bloquear botones
    const createdToast = this.page.getByText(/Lead creado correctamente/i);
    if (await createdToast.count()) {
      try {
        await createdToast.waitFor({ state: 'hidden', timeout: 7000 });
      } catch {
        // si no desaparece en tiempo, continuar: siguiente acciones comprobarán visibilidad
      }
    }
    // Asegurar que el lead ya está visible en la lista
    try {
      await this.expectLeadVisible(name);
    } catch {
      await this.page.waitForTimeout(500);
    }
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
  // Locators y helpers adicionales
  readonly editButton = (leadCard: Locator) => leadCard.getByRole('button', { name: /editar/i });
  readonly deleteButton = (leadCard: Locator) => leadCard.getByRole('button', { name: /eliminar|borrar/i });
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;
  readonly deleteSuccessToast: Locator;

  // Método: obtener la card de un lead por nombre
  getLeadCard(name: string): Locator {
    // Tarjeta principal de lead en el SUT muestra clases concretas (bg-white, rounded-xl, shadow-md)
    const cardSelector = 'div.bg-white.rounded-xl.shadow-md, div.bg-white.rounded-xl.shadow-md.border';
    const cards = this.page.locator(cardSelector).filter({ hasText: name });
    return cards.first();
  }

  // Método: editar un lead
  async editLead(currentName: string, newName: string, newEmail: string) {
    const card = this.getLeadCard(currentName);
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.scrollIntoViewIfNeeded();
    const editBtn = card.getByRole('button', { name: /editar/i }).first();
    await editBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editBtn.click();
    await this.nameInput.fill(newName);
    await this.emailInput.fill(newEmail);
    await this.saveLeadButton.click();
  }

  // Método: eliminar un lead
  async deleteLead(name: string) {
    const card = this.getLeadCard(name);
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.scrollIntoViewIfNeeded();
    const delBtn = card.getByRole('button', { name: /eliminar|borrar/i }).first();
    await delBtn.waitFor({ state: 'visible', timeout: 10000 });
    await delBtn.click();
    await this.confirmDeleteButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.confirmDeleteButton.click();
    await this.deleteSuccessToast.waitFor({ state: 'visible', timeout: 5000 });
  }

   }

  

