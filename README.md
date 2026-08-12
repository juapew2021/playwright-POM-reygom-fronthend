# Playwright + POM — ReyGom CRM (dev / prod)

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
├── .env.dev              # Credenciales/URL de desarrollo (NO se sube a git)
├── .env.prod             # Credenciales/URL de produccion (NO se sube a git)
├── .env.dev.example       # Plantilla dev sin valores reales
└── .env.prod.example      # Plantilla prod sin valores reales
```

## Principio POM aplicado

- **Los tests nunca contienen selectores.** Solo llaman metodos de un Page Object (`loginPage.login(...)`, `dashboardPage.logout()`).
- **Cada pantalla = una clase.** Los locators son propiedades `readonly` inicializadas en el constructor.
- **`BasePage`** concentra lo comun (navegacion, esperas, screenshots) para no repetir codigo entre paginas.
- **Fixtures** (`fixtures/pages.fixture.ts`) instancian los Page Objects automaticamente por test, evitando `new LoginPage(page)` repetido.
- **Datos de prueba separados del codigo** (`test-data/`) y **credenciales fuera del repo** (`.env.dev` / `.env.prod`, gitignored).

## Instalacion

```bash
cd playwright-pom-project
npm install
npx playwright install --with-deps
```

Si `.env.dev` o `.env.prod` no existen, copialos de su plantilla y completa las credenciales:

```bash
cp .env.dev.example .env.dev
cp .env.prod.example .env.prod
```

`.env.dev` ya viene con `admin` cargado para `crm-dev.reygom.com` (verifica que siga siendo el usuario correcto). `.env.prod` esta vacio: agrega tus credenciales de produccion ahi antes de correr `test:prod`.

## Ambientes (dev / prod)

`playwright.config.ts` elige el archivo de variables segun `TEST_ENV` (por defecto `dev`):

| TEST_ENV | Archivo      | BASE_URL                     |
|----------|--------------|-------------------------------|
| `dev`    | `.env.dev`   | https://crm-dev.reygom.com   |
| `prod`   | `.env.prod`  | https://crm.reygom.com       |

No pases `TEST_ENV` a mano: usa los scripts npm de abajo, ya lo setean con `cross-env` (compatible Mac/Linux/Windows).

⚠️ **Cuidado al correr contra `prod`**: son pruebas E2E sobre el CRM real. Antes de correr `test:prod` confirma que los tests no hagan altas/bajas/cambios destructivos contra datos productivos, o usa una cuenta de prueba dedicada si el equipo la tiene.

## Correr los tests

```bash
npm run test:dev          # suite completa contra desarrollo (default de `npm test`)
npm run test:prod         # suite completa contra produccion
npm run test:dev:ui       # modo UI interactivo contra dev (recomendado para debug)
npm run test:prod:ui      # modo UI interactivo contra prod
npm run test:dev:headed   # con navegador visible, contra dev
npm run test:chromium     # solo Chromium (dev)
npm run report             # abre el ultimo reporte HTML
npm run codegen:dev        # graba acciones y genera selectores contra dev
npm run codegen:prod       # graba acciones y genera selectores contra prod
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
