const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0002 T9: estado, rechazo y retiro (B-32, B-33, B-34)', () => {
  let app;
  let models;
  let fx;

  const post = (p) => models.Postulation.findByPk(p.id_postulation, { raw: true });
  const petitionState = async () => (await models.Petition.findByPk(fx.petition.id_petition)).id_state;
  const setState = (p, id_state, winner = false) =>
    models.Postulation.update({ id_state, winner }, { where: { id_postulation: p.id_postulation } });
  const patch = async (user, p, action, body) =>
    request(app).patch(`/api/postulation/${p.id_postulation}/${action}`).set(await bearer(user)).send(body);

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  afterEach(async () => {
    await setState(fx.postulationB, fx.states.PEN);
    await setState(fx.postulationD, fx.states.PEN);
  });

  test('AC-0002-18: el superusuario cambia el estado con un id_state existente (200) y queda en ese estado', async () => {
    const res = await patch(fx.users.admin, fx.postulationB, 'state', { id_state: fx.states.REC });
    expect(res.status).toBe(200);
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.REC);
  });

  test('AC-0002-18: un id_state inexistente o ausente responde 400 y no cambia', async () => {
    for (const body of [{ id_state: 9999 }, {}, { id_state: 'abc' }]) {
      const res = await patch(fx.users.admin, fx.postulationB, 'state', body);
      expect(res.status).toBe(400);
    }
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.PEN);
  });

  test('AC-0002-18 (borde): postulación inexistente o id no numérico responde 404', async () => {
    const h = await bearer(fx.users.admin);
    expect((await request(app).patch('/api/postulation/99999/state').set(h).send({ id_state: fx.states.REC })).status).toBe(404);
    expect((await request(app).patch('/api/postulation/abc/state').set(h).send({ id_state: fx.states.REC })).status).toBe(404);
  });

  test('AC-0002-19: reject del dueño sobre una postulación en PEN responde 200 y queda en REC', async () => {
    const res = await patch(fx.users.A, fx.postulationD, 'reject');
    expect(res.status).toBe(200);
    expect((await post(fx.postulationD)).id_state).toBe(fx.states.REC);
  });

  test('AC-0002-19: reject del dueño sobre una postulación en ACE (ganadora) o FIN responde 409 y nada cambia', async () => {
    for (const code of ['ACE', 'FIN']) {
      await setState(fx.postulationB, fx.states[code], true);
      const res = await patch(fx.users.A, fx.postulationB, 'reject');
      expect(res.status).toBe(409);
      const after = await post(fx.postulationB);
      expect(after.id_state).toBe(fx.states[code]);
      expect(Boolean(after.winner)).toBe(true);
      expect(await petitionState()).toBe(fx.states.PEN);
    }
  });

  test('AC-0002-19: reject de un no dueño sigue respondiendo 403 (la autoría va antes que el estado)', async () => {
    await setState(fx.postulationB, fx.states.ACE, true);
    expect((await patch(fx.users.C, fx.postulationB, 'reject')).status).toBe(403);
    expect((await patch(fx.users.B, fx.postulationB, 'reject')).status).toBe(403);
  });

  test('AC-0002-19: cancel de un proveedor no autor sobre una postulación que no está en PEN responde 403', async () => {
    await setState(fx.postulationB, fx.states.ACE, true);
    const res = await patch(fx.users.D, fx.postulationB, 'cancel');
    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).not.toMatch(/procesada/);
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.ACE);
  });

  test('AC-0002-19: cancel del autor sobre una postulación que no está en PEN responde 409 y no cambia', async () => {
    await setState(fx.postulationB, fx.states.ACE, true);
    const res = await patch(fx.users.B, fx.postulationB, 'cancel');
    expect(res.status).toBe(409);
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.ACE);
  });

  test('AC-0002-19: cancel del autor sobre una postulación en PEN sigue funcionando (BJA)', async () => {
    const res = await patch(fx.users.B, fx.postulationB, 'cancel');
    expect(res.status).toBe(200);
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.BJA);
  });
});
