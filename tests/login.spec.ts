import { test, expect } from '../fixtures/pages.fixture';
import { users } from '../test-data/users';

test.describe('Login - crm-dev.reygom.com', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('el usuario admin puede iniciar sesion con credenciales validas', async ({
    loginPage,
    dashboardPage,
  }) => {
    await loginPage.login(users.admin.username, users.admin.password);

    await loginPage.expectLoginSuccess();
    await expect(dashboardPage.pageHeading).toBeVisible();
  });

  test('muestra un alert nativo con credenciales invalidas', async ({ loginPage }) => {
    // El CRM responde con un window.alert() del navegador, no con un
    // mensaje inline en el DOM.
    const alertMessage = await loginPage.loginAndCaptureAlert(
      'usuario_invalido',
      'password_incorrecto'
    );

    expect(alertMessage).toContain('Credenciales incorrectas');
  });

  test('el boton de login esta deshabilitado o falla con campos vacios', async ({
    page,
    loginPage,
  }) => {
    await loginPage.loginButton.click();

    // Con campos vacios el formulario no deberia navegar fuera del login.
    await expect(page).toHaveURL('https://crm-dev.reygom.com/');
    await expect(loginPage.usernameInput).toBeVisible();
  });
});
