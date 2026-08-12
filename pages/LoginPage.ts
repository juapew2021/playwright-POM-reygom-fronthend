import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la pantalla de login de crm-dev.reygom.com.
 *
 * Selectores verificados inspeccionando el DOM real (ago-2026). El form
 * no tiene id/name/data-testid en los inputs, asi que se localizan por
 * placeholder (visible para el usuario, mas estable que un selector CSS
 * generado). El login vive en la ruta raiz "/" (no en "/login": esa ruta
 * no matchea en el router de la app y deja la pagina en blanco).
 *
 * El mensaje de credenciales invalidas ("Credenciales incorrectas") se
 * muestra con un `window.alert()` nativo del navegador, no con un
 * elemento en el DOM. Playwright descarta los dialogos nativos
 * automaticamente salvo que se registre un listener `page.on('dialog', ...)`
 * antes de disparar la accion que lo abre, por eso `login()` no alcanza:
 * hay que usar `loginAndCaptureAlert()` para capturar el texto y cerrarlo.
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Usuario');
    this.passwordInput = page.getByPlaceholder('Contraseña');
    this.loginButton = page.getByRole('button', { name: /ingresar al sistema/i });
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Usa esto cuando esperas que el login dispare el alert nativo de error
   * (p. ej. credenciales invalidas). Registra el listener de dialogo antes
   * de hacer click para no perder la carrera contra el alert, captura el
   * texto y lo cierra (equivalente a hacer click en "Aceptar").
   */
  async loginAndCaptureAlert(username: string, password: string): Promise<string> {
    const dialogPromise = this.page.waitForEvent('dialog');

    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    return message;
  }

  async expectLoginSuccess(urlPattern: RegExp = /dashboard|home|inicio/): Promise<void> {
    await this.waitForUrl(urlPattern);
  }
}
