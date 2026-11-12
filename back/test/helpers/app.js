// Levanta la app contra la base de test. Se requiere en forma diferida (dentro
// de beforeAll) porque app.js conecta y sincroniza al cargarse, y la base de
// test se prepara en test/setup.js.
let started = null;

async function startApp() {
  if (started) return started;
  const app = require('../../app');
  await app.ready;
  const models = require('../../models');
  started = { app, models };
  return started;
}

async function stopApp() {
  if (!started) return;
  await started.models.sequelize.close();
  started = null;
}

module.exports = { startApp, stopApp };
