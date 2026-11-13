const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0001 T8: aceptar con dueño, estado y un solo ganador (B-07)', () => {
  let app;
  let models;
  let fx;

  const petitionState = async () => (await models.Petition.findByPk(fx.petition.id_petition)).id_state;
  const post = (p) => models.Postulation.findByPk(p.id_postulation, { raw: true });
  const accept = async (user, p) =>
    request(app).patch(`/api/postulation/${p.id_postulation}/accept`).set(await bearer(user));
  const winners = () => models.Postulation.count({ where: { id_petition: fx.petition.id_petition, winner: true } });

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0001-12: accept con token del proveedor autor (y de C, D, superusuario) responde 403 y todo sigue en PEN', async () => {
    for (const intruder of [fx.users.B, fx.users.D, fx.users.C, fx.users.admin]) {
      const res = await accept(intruder, fx.postulationB);
      expect(res.status).toBe(403);
    }
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.PEN);
    expect((await post(fx.postulationB)).winner).toBeFalsy();
    expect(await petitionState()).toBe(fx.states.PEN);
  });

  test('AC-0001-13: accept del dueño sobre petición en CAN responde 409 y ningún estado cambia', async () => {
    await models.Petition.update({ id_state: fx.states.CAN }, { where: { id_petition: fx.petition.id_petition } });
    const res = await accept(fx.users.A, fx.postulationB);
    expect(res.status).toBe(409);
    expect(await petitionState()).toBe(fx.states.CAN);
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.PEN);
    expect((await post(fx.postulationD)).id_state).toBe(fx.states.PEN);
    await models.Petition.update({ id_state: fx.states.PEN }, { where: { id_petition: fx.petition.id_petition } });
  });

  test('AC-0001-13: accept del dueño sobre postulación en REC responde 409 y ningún estado cambia', async () => {
    await models.Postulation.update({ id_state: fx.states.REC }, { where: { id_postulation: fx.postulationB.id_postulation } });
    const res = await accept(fx.users.A, fx.postulationB);
    expect(res.status).toBe(409);
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.REC);
    expect((await post(fx.postulationD)).id_state).toBe(fx.states.PEN);
    expect(await petitionState()).toBe(fx.states.PEN);
    await models.Postulation.update({ id_state: fx.states.PEN }, { where: { id_postulation: fx.postulationB.id_postulation } });
  });

  test('AC-0001-13 (borde): id inexistente o no numérico responde 404', async () => {
    const h = await bearer(fx.users.A);
    expect((await request(app).patch('/api/postulation/99999/accept').set(h)).status).toBe(404);
    expect((await request(app).patch('/api/postulation/abc/accept').set(h)).status).toBe(404);
  });

  test('Casos de borde: un fallo antes del commit hace rollback completo y responde 500 sin el detalle', async () => {
    const service = require('../services/postulationService');
    const spy = jest.spyOn(service, 'cancelPostulationsForPetition').mockRejectedValue(new Error('ECONNREFUSED 10.0.0.9:3306 secreto'));
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const res = await accept(fx.users.A, fx.postulationB);
      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).not.toMatch(/ECONNREFUSED|secreto|10\.0\.0\.9/);
    } finally {
      spy.mockRestore();
      quiet.mockRestore();
    }
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.PEN);
    expect((await post(fx.postulationB)).winner).toBeFalsy();
    expect(await petitionState()).toBe(fx.states.PEN);
  });

  test('AC-0001-14: dos accept concurrentes sobre postulaciones distintas: uno 200, otro 409, un solo winner', async () => {
    const [r1, r2] = await Promise.all([accept(fx.users.A, fx.postulationB), accept(fx.users.A, fx.postulationD)]);
    expect([r1.status, r2.status].sort()).toEqual([200, 409]);
    expect(await winners()).toBe(1);
    expect(await petitionState()).toBe(fx.states.ACE);
  });

  test('AC-0001-13 (borde): aceptar dos veces la misma postulación, la segunda da 409', async () => {
    const winner = (await post(fx.postulationB)).winner ? fx.postulationB : fx.postulationD;
    const res = await accept(fx.users.A, winner);
    expect(res.status).toBe(409);
    expect(await winners()).toBe(1);
  });
});
