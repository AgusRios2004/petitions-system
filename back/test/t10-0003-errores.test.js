const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0003 T1: errores con su código y sin /winner (B-30)', () => {
  let app;
  let models;
  let fx;

  const post = (p) => models.Postulation.findByPk(p.id_postulation, { raw: true });

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0003-07: PATCH /:id/winner responde 404 y winner no cambia', async () => {
    const res = await request(app)
      .patch(`/api/postulation/${fx.postulationB.id_postulation}/winner`)
      .set(await bearer(fx.users.A))
      .send({ winner: true });
    expect(res.status).toBe(404);
    expect((await post(fx.postulationB)).winner).toBeFalsy();
  });

  test('AC-0003-10: cancel de D sobre la postulación de B responde 403 y no cambia el estado', async () => {
    const res = await request(app)
      .patch(`/api/postulation/${fx.postulationB.id_postulation}/cancel`)
      .set(await bearer(fx.users.D));
    expect(res.status).toBe(403);
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.PEN);
  });

  test('AC-0003-10: reject de C sobre la postulación de B responde 403 y no cambia el estado', async () => {
    const res = await request(app)
      .patch(`/api/postulation/${fx.postulationB.id_postulation}/reject`)
      .set(await bearer(fx.users.C));
    expect(res.status).toBe(403);
    expect((await post(fx.postulationB)).id_state).toBe(fx.states.PEN);
  });

  test('AC-0003-10: finish a un id inexistente responde 404', async () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const res = await request(app).patch('/api/postulation/99999/finish').set(await bearer(fx.users.B));
      expect(res.status).toBe(404);
    } finally {
      quiet.mockRestore();
    }
  });

  test('AC-0003-10: reject y cancel a un id inexistente responden 404, no 500', async () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect((await request(app).patch('/api/postulation/99999/reject').set(await bearer(fx.users.A))).status).toBe(404);
      expect((await request(app).patch('/api/postulation/99999/cancel').set(await bearer(fx.users.B))).status).toBe(404);
    } finally {
      quiet.mockRestore();
    }
  });
});
