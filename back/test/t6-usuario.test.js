const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0001 T6: IDOR de usuario (B-03)', () => {
  let app;
  let models;
  let fx;

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  const emailOf = async (u) => (await models.User.findByPk(u.id_user)).email;

  test('AC-0001-09: PUT /api/profile/user/:idA con token de B responde 403 y el email de A queda igual', async () => {
    const before = await emailOf(fx.users.A);
    const res = await request(app)
      .put(`/api/profile/user/${fx.users.A.id_user}`)
      .set(await bearer(fx.users.B))
      .send({ email: 'robado@evil.test', name: 'Pwn' });
    expect(res.status).toBe(403);
    expect(await emailOf(fx.users.A)).toBe(before);
    expect((await models.User.findByPk(fx.users.A.id_user)).name).not.toBe('Pwn');
  });

  test('AC-0001-09: con token de A responde 200 y cambia', async () => {
    const res = await request(app)
      .put(`/api/profile/user/${fx.users.A.id_user}`)
      .set(await bearer(fx.users.A))
      .send({ name: 'Nuevo' });
    expect(res.status).toBe(200);
    expect((await models.User.findByPk(fx.users.A.id_user)).name).toBe('Nuevo');
    expect(JSON.stringify(res.body)).not.toMatch(/"password"/);
  });

  test('AC-0001-09 (borde): el superusuario no saltea la verificación; id inexistente o no numérico da 404', async () => {
    const res = await request(app)
      .put(`/api/profile/user/${fx.users.A.id_user}`)
      .set(await bearer(fx.users.admin))
      .send({ name: 'Admin edita' });
    expect(res.status).toBe(403);
    expect((await request(app).put('/api/profile/user/99999').set(await bearer(fx.users.A)).send({ name: 'x' })).status).toBe(404);
    expect((await request(app).put('/api/profile/user/abc').set(await bearer(fx.users.A)).send({ name: 'x' })).status).toBe(404);
  });
});
