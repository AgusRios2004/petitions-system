// loginAs(user): token real, pidiéndolo a POST /api/auth/login.
// socketAs(user): socket.io-client conectado al servidor de test con ese token.
const request = require('supertest');
const { io: ioClient } = require('socket.io-client');
const { startApp, startServer } = require('./app');
const { PASSWORD } = require('./fixtures');

const tokens = new Map();

async function loginAs(user, password = PASSWORD) {
  if (tokens.has(user.email)) return tokens.get(user.email);
  const { app } = await startApp();
  const res = await request(app).post('/api/auth/login').send({ email: user.email, password });
  if (res.status !== 200 || !res.body.accessToken) {
    throw new Error(`loginAs(${user.email}) falló: ${res.status} ${JSON.stringify(res.body)}`);
  }
  tokens.set(user.email, res.body.accessToken);
  return res.body.accessToken;
}

async function bearer(user) {
  return { Authorization: `Bearer ${await loginAs(user)}` };
}

async function socketAs(user) {
  const token = await loginAs(user);
  const { url, trackSocket } = await startServer();
  const socket = ioClient(url, { auth: { token }, transports: ['websocket'], forceNew: true, reconnection: false });
  trackSocket(socket);
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });
  return socket;
}

module.exports = { loginAs, bearer, socketAs };
