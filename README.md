# Playwright + POM — crm-dev.reygom.com

Suite de pruebas E2E de frontend con [Playwright](https://playwright.dev/) y TypeScript, organizada con el patron **Page Object Model (POM)**.

## Estructura

```
playwright-pom-project/
├── pages/               # Page Objects: un archivo por pantalla
│   ├── BasePage.ts      # Clase padre con helpers comunes (goto, esperas, aserciones)
│   ├── LoginPage.ts      # Locators + acciones del login
│   └── DashboardPage.ts  # Locators + acciones del dashboard post-login
├── fixtures/
│   └── pages.fixture.ts  # Extiende `test` de Playwright para inyectar Page Objects
├── test-data/
│   └── users.ts          # Datos de prueba (credenciales via variables de entorno)
├── tests/
│   └── login.spec.ts     # Specs: solo orquestan Page Objects, sin selectores
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .env                  # Credenciales locales (NO se sube a git)
└── .env.example           # Plantilla sin valores reales
```

## Principio POM aplicado

- **Los tests nunca contienen selectores.** Solo llaman metodos de un Page Object (`loginPage.login(...)`, `dashboardPage.logout()`).
- **Cada pantalla = una clase.** Los locators son propiedades `readonly` inicializadas en el constructor.
- **`BasePage`** concentra lo comun (navegacion, esperas, screenshots) para no repetir codigo entre paginas.
- **Fixtures** (`fixtures/pages.fixture.ts`) instancian los Page Objects automaticamente por test, evitando `new LoginPage(page)` repetido.
- **Datos de prueba separados del codigo** (`test-data/`) y **credenciales fuera del repo** (`.env`, gitignored).

## Instalacion

```bash
cd playwright-pom-project
npm install
npx playwright install --with-deps
```

Copia `.env.example` a `.env` si no existe y completa tus credenciales (ya viene configurado con `admin` para este entorno de desarrollo — verifica que sea el correcto):

```bash
cp .env.example .env
```

## Correr los tests

```bash
npm test                 # todos los navegadores configurados
npm run test:headed      # con navegador visible
npm run test:ui          # modo UI interactivo (recomendado para debug)
npm run test:chromium    # solo Chromium
npm run report            # abre el ultimo reporte HTML
```

## Estado de los selectores

`LoginPage.ts` ya tiene los selectores reales verificados inspeccionando `crm-dev.reygom.com`:

- El login esta en la ruta raiz `/` (no en `/login`: esa ruta no matchea en el router SPA y deja la pagina en blanco).
- El formulario no tiene `id`/`name`/`data-testid` en los inputs, asi que se localizan por placeholder: `getByPlaceholder('Usuario')` y `getByPlaceholder('Contraseña')`.
- El boton es `getByRole('button', { name: /ingresar al sistema/i })`.

**Credenciales invalidas:** el CRM no muestra un mensaje inline en el DOM, dispara un `window.alert()` nativo del navegador con el texto "Credenciales incorrectas" (confirmado probando tu mismo en pantalla). Por eso `LoginPage.ts` no tiene un locator `errorMessage`; en vez de eso expone `loginAndCaptureAlert(username, password)`, que registra el listener de `dialog` antes de hacer click, captura el texto del alert y lo cierra (equivalente a "Aceptar"). El test `tests/login.spec.ts` ya usa este metodo.

**Dashboard post-login:** confirmado con el trace de una corrida real que el login exitoso navega a `/dashboard` y que hay dos `<h1>` en la pagina (el logo "ReyGom CRM" del sidebar y el titulo "Dashboard" del contenido) — `pageHeading` en `DashboardPage.ts` usa `getByRole('heading', { name: 'Dashboard', exact: true })` para desambiguar en vez de `locator('h1')`. El sidebar tampoco tiene un menu de usuario separado, asi que `logout()` hace click directo en el boton "Cerrar sesión" visible.

## Agregar una nueva pantalla

1. Crea `pages/NuevaPage.ts` extendiendo `BasePage`, con locators + metodos de accion.
2. Registrala en `fixtures/pages.fixture.ts`.
3. Escribe el spec en `tests/` usando solo los metodos del Page Object.
