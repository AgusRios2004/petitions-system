const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0003 T3: finalizar solo el autor y solo en ACE (B-30)', () => {
  let app;
  let models;
  let fx;

  const row = (p) => models.Postulation.findByPk(p.id_postulation, { raw: true });
  const finish = async (user, p) =>
    request(app).patch(`/api/postulation/${p.id_postulation}/finish`).set(await bearer(user));

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0003-08: finish con token de D, A o C responde 403; de B en PEN responde 409; el estado no cambia', async () => {
    for (const intruder of [fx.users.D, fx.users.A, fx.users.C]) {
      expect((await finish(intruder, fx.postulationB)).status).toBe(403);
    }
    expect((await finish(fx.users.B, fx.postulationB)).status).toBe(409);
    expect((await row(fx.postulationB)).id_state).toBe(fx.states.PEN);
  });

  test('AC-0003-08 (borde): finish de B con winner true pero en PEN también responde 409', async () => {
    await models.Postulation.update({ winner: true }, { where: { id_postulation: fx.postulationB.id_postulation } });
    expect((await finish(fx.users.B, fx.postulationB)).status).toBe(409);
    expect((await row(fx.postulationB)).id_state).toBe(fx.states.PEN);
    await models.Postulation.update({ winner: false }, { where: { id_postulation: fx.postulationB.id_postulation } });
  });

  test('AC-0003-09: ganadora en ACE, finish de B responde 200 y queda en FIN; el segundo finish responde 409', async () => {
    await models.Postulation.update(
      { winner: true, id_state: fx.states.ACE },
      { where: { id_postulation: fx.postulationB.id_postulation } },
    );
    const res = await finish(fx.users.B, fx.postulationB);
    expect(res.status).toBe(200);
    expect((await row(fx.postulationB)).id_state).toBe(fx.states.FIN);
    expect((await finish(fx.users.B, fx.postulationB)).status).toBe(409);
    expect((await row(fx.postulationB)).id_state).toBe(fx.states.FIN);
  });
});
