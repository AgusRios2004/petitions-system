const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0002 T3: postulaciones por relación, no por is_staff', () => {
  let app;
  let fx;

  const list = async (user) =>
    request(app).get(`/api/postulation?id_petition=${fx.petition.id_petition}`).set(await bearer(user));

  beforeAll(async () => {
    let models;
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0002-09: un proveedor que no es dueño ve solo su propia postulación (aunque is_staff sea true)', async () => {
    const res = await list(fx.users.B);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data.every((p) => p.id_provider === fx.providerB.id_provider)).toBe(true);
  });

  test('AC-0002-09: un proveedor no puede ampliar la vista pasando id_provider ajeno', async () => {
    const res = await request(app)
      .get(`/api/postulation?id_petition=${fx.petition.id_petition}&id_provider=${fx.providerD.id_provider}`)
      .set(await bearer(fx.users.B));
    expect(res.status).toBe(200);
    expect(res.body.data.every((p) => p.id_provider === fx.providerB.id_provider)).toBe(true);
  });

  test('AC-0002-09: el cliente dueño ve las dos postulaciones del fixture', async () => {
    const res = await list(fx.users.A);
    expect(res.status).toBe(200);
    expect(res.body.data.map((p) => p.id_provider).sort()).toEqual(
      [fx.providerB.id_provider, fx.providerD.id_provider].sort(),
    );
  });

  test('AC-0002-09: un usuario con los dos perfiles que no es dueño ve solo la suya; un cliente ajeno recibe 403', async () => {
    const e = await list(fx.users.E);
    expect(e.status).toBe(200);
    expect(e.body.data).toEqual([]);
    expect((await list(fx.users.C)).status).toBe(403);
  });

  test('AC-0002-10: PATCH /:id/state con token de un proveedor responde 403', async () => {
    for (const user of [fx.users.B, fx.users.A, fx.users.E]) {
      const res = await request(app)
        .patch(`/api/postulation/${fx.postulationB.id_postulation}/state`)
        .set(await bearer(user)).send({ id_state: fx.states.REC });
      expect(res.status).toBe(403);
    }
  });

  test('AC-0002-09 (mínimo privilegio): nada en middlewares expone onlyStaff', () => {
    expect(require('../middlewares/auth').onlyStaff).toBeUndefined();
  });
});
