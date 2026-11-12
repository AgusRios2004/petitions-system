// Levanta la app contra la base de test. Se requiere en forma diferida (dentro
// de beforeAll) porque app.js conecta y sincroniza al cargarse, y la base de
// test se prepara en test/setup.js.
let started = null;
let serverStarted = null;
const clientSockets = [];

async function startApp() {
  if (started) return started;
  const app = require('../../app');
  await app.ready;
  const models = require('../../models');
  started = { app, models };
  return started;
}

// Servidor HTTP + Socket.IO real (server.js) en un puerto libre.
async function startServer() {
  if (serverStarted) return serverStarted;
  await startApp();
  const { server, io } = require('../../server');
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  serverStarted = {
    server,
    io,
    url: `http://127.0.0.1:${server.address().port}`,
    trackSocket: (socket) => clientSockets.push(socket),
  };
  return serverStarted;
}

async function stopApp() {
  clientSockets.splice(0).forEach((socket) => socket.close());
  if (serverStarted) {
    await new Promise((resolve) => serverStarted.io.close(resolve));
    serverStarted = null;
  }
  if (!started) return;
  await started.models.sequelize.close();
  started = null;
}

module.exports = { startApp, startServer, stopApp };
