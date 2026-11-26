const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0004 T3: GET /api/postulation sin id_petition solo para el proveedor dueño', () => {
  let app;
  let fx;

  const list = async (user, query) =>
    request(app).get(`/api/postulation?${query}`).set(await bearer(user));

  beforeAll(async () => {
    let models;
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0004-04: con token de B, id_provider propio e id_state PEN devuelve su postulación pendiente', async () => {
    const res = await list(fx.users.B, `id_provider=${fx.providerB.id_provider}&id_state=${fx.states.PEN}`);
    expect(res.status).toBe(200);
    expect(res.body.data.map((p) => p.id_postulation)).toEqual([fx.postulationB.id_postulation]);
    const other = await list(fx.users.B, `id_provider=${fx.providerB.id_provider}&id_state=${fx.states.REC}`);
    expect(other.status).toBe(200);
    expect(other.body.data).toEqual([]);
  });

  test('AC-0004-04: con token de D, de A o de C, el id_provider de B responde 403', async () => {
    for (const user of [fx.users.D, fx.users.A, fx.users.C]) {
      const res = await list(user, `id_provider=${fx.providerB.id_provider}&id_state=${fx.states.PEN}`);
      expect(res.status).toBe(403);
    }
  });

  test('AC-0004-05: id_provider de B con id_state=1, sin id_petition y con token de D responde 403 (sin atajo público)', async () => {
    const res = await list(fx.users.D, `id_provider=${fx.providerB.id_provider}&id_state=1`);
    expect(res.status).toBe(403);
  });

  test('AC-0004-04 (borde): sin id_provider o con id_provider no numérico responde 403', async () => {
    expect((await list(fx.users.B, `id_state=${fx.states.PEN}`)).status).toBe(403);
    expect((await list(fx.users.B, 'id_provider=abc')).status).toBe(403);
  });

  test('AC-0004-04 (borde): el superusuario sigue viendo todo', async () => {
    const res = await list(fx.users.admin, '');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});
