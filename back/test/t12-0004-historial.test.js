const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0004 T2: historial público del proveedor con los campos mínimos', () => {
  let app;
  let models;
  let fx;

  const history = async (id, user = fx.users.D) =>
    request(app).get(`/api/provider/${id}/history`).set(await bearer(user));
  const setState = (code) =>
    models.Postulation.update(
      { id_state: fx.states[code] },
      { where: { id_postulation: fx.postulationB.id_postulation } },
    );

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0004-01: solo aparecen las postulaciones en ACE y FIN; PEN, REC, CAN y BJA no', async () => {
    for (const code of ['PEN', 'REC', 'CAN', 'BJA']) {
      await setState(code);
      const res = await history(fx.providerB.id_provider);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    }
    for (const code of ['ACE', 'FIN']) {
      await setState(code);
      const res = await history(fx.providerB.id_provider);
      expect(res.status).toBe(200);
      expect(res.body.data.map((p) => p.id_postulation)).toEqual([fx.postulationB.id_postulation]);
      expect(res.body.data[0].state).toBe(code === 'ACE' ? 'Aceptado' : 'Finalizado');
    }
    // D no tiene nada ganado: no ve la postulación de B ni la suya en PEN.
    expect((await history(fx.providerD.id_provider)).body.data).toEqual([]);
  });

  test('AC-0004-02: cada elemento tiene exactamente las claves mínimas y no filtra datos de la oferta ni del cliente', async () => {
    await setState('ACE');
    const res = await history(fx.providerB.id_provider);
    expect(res.status).toBe(200);
    const [item] = res.body.data;
    expect(Object.keys(item).sort()).toEqual(['date', 'id_postulation', 'petition', 'state']);
    expect(Object.keys(item.petition).sort()).toEqual(['description', 'id_petition']);
    expect(item.petition.id_petition).toBe(fx.petition.id_petition);
    expect(item.date).toBeTruthy();
    const text = JSON.stringify(res.body);
    for (const word of ['cost', 'proposal', 'email', 'dni', 'phone', 'customers']) {
      expect(text).not.toContain(`"${word}"`);
    }
  });

  test('AC-0004-02 (borde): el orden es del más reciente al más viejo y date usa date_update o, si no hay, date_create', async () => {
    const petition2 = await models.Petition.create({
      ...fx.petition.get({ plain: true }), id_petition: undefined, description: 'Segunda petición de A',
    });
    const newer = await models.Postulation.create({
      id_petition: petition2.id_petition, id_provider: fx.providerB.id_provider,
      proposal: 'otra', cost: 1, id_state: fx.states.FIN, id_user_create: fx.users.B.id_user,
      winner: true, date_create: new Date(Date.now() - 86400000), date_update: null,
    });
    await setState('ACE');
    const old = new Date(Date.now() - 10 * 86400000);
    await models.Postulation.update(
      { date_update: old },
      { where: { id_postulation: fx.postulationB.id_postulation } },
    );
    const res = await history(fx.providerB.id_provider);
    expect(res.body.data.map((p) => p.id_postulation)).toEqual([newer.id_postulation, fx.postulationB.id_postulation]);
    expect(new Date(res.body.data[1].date).getTime()).toBe(old.getTime());
    await newer.destroy();
  });

  test('AC-0004-03: un id inexistente o no numérico responde 404; sin token, 401', async () => {
    expect((await history(999999)).status).toBe(404);
    expect((await history('abc')).status).toBe(404);
    const anon = await request(app).get(`/api/provider/${fx.providerB.id_provider}/history`);
    expect(anon.status).toBe(401);
  });
});
