/**
 * Datos de usuarios de prueba.
 * Las credenciales NUNCA se hardcodean aqui: se leen de variables de
 * entorno (definidas en tu .env local, que esta en .gitignore) para que
 * el codigo del repo no contenga secretos.
 */
export const users = {
  admin: {
    username: process.env.TEST_USERNAME ?? '',
    password: process.env.TEST_PASSWORD ?? '',
  },
};
