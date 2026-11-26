const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0003 T4: leer solo autor, dueño o superusuario (B-30)', () => {
  let app;
  let fx;

  const get = async (user, id) => request(app).get(`/api/postulation/${id}`).set(await bearer(user));

  beforeAll(async () => {
    ({ app } = await startApp());
    const { models } = await startApp();
    fx = await createAccessFixtures(models);
  });

  test('AC-0003-11: GET de la postulación de B con token de B, A o superusuario responde 200', async () => {
    for (const user of [fx.users.B, fx.users.A, fx.users.admin]) {
      const res = await get(user, fx.postulationB.id_postulation);
      expect(res.status).toBe(200);
    }
  });

  test('AC-0003-11: GET con token de D o C responde 403', async () => {
    for (const user of [fx.users.D, fx.users.C]) {
      const res = await get(user, fx.postulationB.id_postulation);
      expect(res.status).toBe(403);
      expect(JSON.stringify(res.body)).not.toContain('Propuesta de');
    }
  });

  test('AC-0003-11: id inexistente o no numérico responde 404', async () => {
    expect((await get(fx.users.A, 99999)).status).toBe(404);
    expect((await get(fx.users.A, 'abc')).status).toBe(404);
  });
});
