const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0001 T7: PUT de petición solo para el dueño (B-06)', () => {
  let app;
  let models;
  let fx;
  let idPet;

  const petitionRow = () => models.Petition.findByPk(idPet, { raw: true });
  const body = (extra = {}) => ({
    id_customer: fx.customerA.id_customer,
    id_type_petition: fx.catalog.typePetition.id_type_petition,
    description: 'Descripción editada',
    date_since: new Date().toISOString(),
    date_until: new Date(Date.now() + 86400000).toISOString(),
    id_state: fx.states.PEN,
    ...extra,
  });

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
    idPet = fx.petition.id_petition;
  });

  test('AC-0001-10: PUT /api/petition/:idPetA con token de B (y de C) responde 403 y la descripción queda igual', async () => {
    const before = await petitionRow();
    for (const intruder of [fx.users.B, fx.users.C, fx.users.admin]) {
      const res = await request(app).put(`/api/petition/${idPet}`).set(await bearer(intruder)).send(body());
      expect(res.status).toBe(403);
    }
    expect(await petitionRow()).toEqual(before);
  });

  test('AC-0001-10 (borde): sin token 401; id inexistente o no numérico 404', async () => {
    expect((await request(app).put(`/api/petition/${idPet}`).send(body())).status).toBe(401);
    const h = await bearer(fx.users.A);
    expect((await request(app).put('/api/petition/99999').set(h).send(body())).status).toBe(404);
    expect((await request(app).put('/api/petition/abc').set(h).send(body())).status).toBe(404);
  });

  test('AC-0001-11: PUT de A con id_customer de B e id_state CAN responde 200 y conserva id_customer e id_state', async () => {
    const before = await petitionRow();
    const res = await request(app)
      .put(`/api/petition/${idPet}`)
      .set(await bearer(fx.users.A))
      .send(body({ id_customer: fx.customerC.id_customer, id_state: fx.states.CAN }));
    expect(res.status).toBe(200);
    const after = await petitionRow();
    expect(after.id_customer).toBe(before.id_customer);
    expect(after.id_state).toBe(before.id_state);
    expect(after.description).toBe('Descripción editada');
  });

  test('AC-0001-11 (borde): el front puede omitir id_customer e id_state y el dueño igual edita', async () => {
    const { id_customer, id_state, ...rest } = body({ description: 'Sin ids' });
    const res = await request(app).put(`/api/petition/${idPet}`).set(await bearer(fx.users.A)).send(rest);
    expect(res.status).toBe(200);
    expect((await petitionRow()).description).toBe('Sin ids');
  });
});
