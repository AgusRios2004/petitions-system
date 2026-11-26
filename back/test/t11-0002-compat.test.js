const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures, PASSWORD } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

const ALLOWED_CLAIMS = ['sub', 'email', 'is_superuser', 'iat', 'exp'];

const listJs = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) return listJs(p);
  return e.name.endsWith('.js') ? [p] : [];
});

describe('spec 0002 T8: se quita la compatibilidad (sin role ni is_staff en la API)', () => {
  let app;
  let models;
  let fx;

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0002-11: controllers, services y middlewares no contienen la cadena is_staff', () => {
    const offenders = [];
    for (const dir of ['controllers', 'services', 'middlewares']) {
      for (const file of listJs(path.join(__dirname, '..', dir))) {
        if (fs.readFileSync(file, 'utf8').includes('is_staff')) offenders.push(path.relative(path.join(__dirname, '..'), file));
      }
    }
    expect(offenders).toEqual([]);
  });

  test('AC-0002-12: las claves del JWT (access, refresh y refrescado) son un subconjunto de {sub,email,is_superuser,iat,exp}', async () => {
    for (const user of [fx.users.A, fx.users.B, fx.users.E, fx.users.admin]) {
      const login = await request(app).post('/api/auth/login').send({ email: user.email, password: PASSWORD });
      expect(login.status).toBe(200);
      const tokens = [login.body.accessToken, login.body.refreshToken];
      const refreshed = await request(app).post('/api/auth/refresh').send({ refreshToken: login.body.refreshToken });
      expect(refreshed.status).toBe(200);
      tokens.push(refreshed.body.data);
      for (const t of tokens) {
        const claims = Object.keys(jwt.decode(t));
        expect(claims.length).toBeGreaterThan(0);
        expect(claims.filter((k) => !ALLOWED_CLAIMS.includes(k))).toEqual([]);
      }
    }
  });

  test('AC-0002-12: ni el user del login ni /profile/me contienen is_staff ni role', async () => {
    for (const user of [fx.users.A, fx.users.B, fx.users.E, fx.users.admin]) {
      const login = await request(app).post('/api/auth/login').send({ email: user.email, password: PASSWORD });
      expect(login.body.user).not.toHaveProperty('is_staff');
      expect(login.body.user).not.toHaveProperty('role');
      expect(login.body.user).toHaveProperty('roles');
    }
    for (const user of [fx.users.A, fx.users.B, fx.users.E]) {
      const me = await request(app).get('/api/profile/me').set(await bearer(user));
      expect(me.status).toBe(200);
      expect(me.body.data).not.toHaveProperty('is_staff');
      expect(me.body.data).not.toHaveProperty('role');
      expect(me.body.data).toHaveProperty('roles');
    }
  });
});
