const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');
const { countKey } = require('./helpers/json');

describe('spec 0001 T2: User sin password (B-01)', () => {
  let app;
  let fx;

  beforeAll(async () => {
    let models;
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0001-01: la clave password aparece 0 veces en las respuestas, con tokens de A y B y sin token donde es público', async () => {
    const publicGets = [
      '/api/provider',
      `/api/provider/${fx.providerB.id_provider}`,
      `/api/provider/public/${fx.providerB.id_provider}`,
      '/api/article',
      `/api/article/${fx.article.id_article}`,
      '/api/offer',
    ];
    const authGets = [
      `/api/provider/details/${fx.providerB.id_provider}`,
      `/api/postulation/${fx.postulationB.id_postulation}`,
      '/api/profile/me',
    ];
    const headersA = await bearer(fx.users.A);
    const headersB = await bearer(fx.users.B);

    const calls = [];
    for (const url of publicGets) {
      calls.push({ name: `GET ${url} (sin token)`, req: request(app).get(url) });
    }
    for (const url of [...publicGets, ...authGets]) {
      calls.push({ name: `GET ${url} (A)`, req: request(app).get(url).set(headersA) });
      calls.push({ name: `GET ${url} (B)`, req: request(app).get(url).set(headersB) });
    }
    // El perfil de cliente solo lo ve su dueño.
    calls.push({
      name: 'GET /api/customer/:idA (A, dueño)',
      req: request(app).get(`/api/customer/${fx.customerA.id_customer}`).set(headersA),
    });
    for (const user of [fx.users.A, fx.users.B]) {
      calls.push({
        name: `POST /api/auth/login (${user.email})`,
        req: request(app).post('/api/auth/login').send({ email: user.email, password: fx.password }),
      });
    }

    const failures = [];
    for (const { name, req } of calls) {
      const res = await req;
      // Un 4xx/5xx no trae datos: si el endpoint no respondió 200, el recorrido
      // no demuestra nada.
      if (res.status !== 200) failures.push(`${name}: status ${res.status}`);
      const hits = countKey(res.body, 'password');
      if (hits !== 0) failures.push(`${name}: password aparece ${hits} veces`);
    }
    expect(failures).toEqual([]);
  });

  test('AC-0001-02: login con la contraseña correcta devuelve accessToken; con una incorrecta, no', async () => {
    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: fx.users.A.email, password: fx.password });
    expect(ok.status).toBe(200);
    expect(typeof ok.body.accessToken).toBe('string');

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: fx.users.A.email, password: 'otra-clave' });
    expect(bad.body.accessToken).toBeUndefined();
    expect(bad.status).not.toBe(200);
  });
});
