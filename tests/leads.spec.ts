import { test, expect } from '../fixtures/pages.fixture';
import { users } from '../test-data/users';

const validLead = {
  name: `Lead ${Date.now()}`,
  email: `lead.${Date.now()}@example.com`,
};

test.describe('Leads - ReyGom CRM', () => {
  test.beforeEach(async ({ leadsPage, loginPage }) => {
    await loginPage.open();
    await loginPage.login(users.admin.username, users.admin.password);
    await loginPage.expectLoginSuccess();
    await leadsPage.open();
  });

  test('la página de leads carga correctamente', async ({ leadsPage }) => {
    expect(await leadsPage.isLoaded()).toBeTruthy();
  });

  test('se puede crear un lead con todos los campos válidos', async ({ leadsPage }) => {
    const name = 'juan perez';
    const email = `juan.perez.${Date.now()}@example.com`; // email único
    const phone = '5551234567';
    await leadsPage.createLead(name, email, phone);

    // AJUSTAR: aún no confirmamos qué pasa tras crear con éxito
    // (¿aparece en la tabla?, ¿toast?, ¿redirección?)
    await leadsPage.expectLeadVisible(name);
  });
});

test('no permite crear un lead sin nombre', async ({ leadsPage, loginPage }) => {
  await loginPage.open();
  await loginPage.login(users.admin.username, users.admin.password);
  await loginPage.expectLoginSuccess();
  await leadsPage.open();

  await leadsPage.newLeadButton.click();
  await leadsPage.emailInput.fill(`sin.nombre.${Date.now()}@example.com`);
  await leadsPage.saveLeadButton.click();

  await expect(leadsPage.nameInput).toHaveJSProperty('validity.valid', false);
  await expect(leadsPage.nameInput).toBeFocused();
});

test('permite crear un lead sin email', async ({ leadsPage, loginPage }) => {
  await loginPage.open();
  await loginPage.login(users.admin.username, users.admin.password);
  await loginPage.expectLoginSuccess();
  await leadsPage.open();

  await leadsPage.newLeadButton.click();
  await leadsPage.nameInput.fill('Luisa García');
  await leadsPage.saveLeadButton.click();

  // El SUT permite crear leads sin email; verificamos que aparece en la lista.
  await leadsPage.expectLeadVisible('Luisa García');
});

test('permite crear un lead con email de formato inválido', async ({ leadsPage, loginPage }) => {
  await loginPage.open();
  await loginPage.login(users.admin.username, users.admin.password);
  await loginPage.expectLoginSuccess();
  await leadsPage.open();

  await leadsPage.newLeadButton.click();
  await leadsPage.nameInput.fill('Luisa García');
  await leadsPage.emailInput.fill('abc123');
  await leadsPage.saveLeadButton.click();

    // HALLAZGO: el campo Email no tiene validación de formato en el frontend
  // (no es type="email" ni tiene validación custom). El sistema acepta
  // cualquier texto y crea el lead igual. Comportamiento esperado: debería
  // rechazar formatos inválidos. Severidad sugerida: Baja/Media.
  // El SUT no valida formato de email en cliente; verificamos que el lead aparece.
  
  await leadsPage.expectLeadVisible('Luisa García');
});

test('se puede editar un lead existente', async ({ leadsPage, page, loginPage }) => {
  await loginPage.open();
  await loginPage.login(users.admin.username, users.admin.password);
  await loginPage.expectLoginSuccess();
  await leadsPage.open();
  await leadsPage.createLead(validLead.name, validLead.email);
  await leadsPage.editLead(validLead.name, 'Juan Editado', 'juan.editado@example.com');
  await expect(page.getByText('Juan Editado').first()).toBeVisible();
});

test('se puede eliminar un lead', async ({ leadsPage, page, loginPage }) => {
  await loginPage.open();
  await loginPage.login(users.admin.username, users.admin.password);
  await loginPage.expectLoginSuccess();
  await leadsPage.open();
  await leadsPage.createLead(validLead.name, validLead.email);
  await leadsPage.deleteLead(validLead.name);
  await expect(leadsPage.deleteSuccessToast).toBeVisible();
  await expect(page.getByText(validLead.name)).not.toBeVisible();
});

