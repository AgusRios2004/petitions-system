const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0002 T5: postularse (perfil recién activado, no a lo propio)', () => {
  let app;
  let models;
  let fx;

  const postulate = async (user, id_petition) =>
    request(app).post('/api/postulation').set(await bearer(user)).send({ id_petition, proposal: 'Hago el trabajo', cost: 1000 });

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0002-04: con el mismo token, tras activar el perfil de proveedor, el cliente C se postula a la petición de A', async () => {
    const h = await bearer(fx.users.C); // token emitido antes de activar el perfil
    const act = await request(app).post('/api/profile/me/provider').set(h).send({
      id_profession: fx.catalog.profession.id_profession, id_type_provider: fx.catalog.typeProvider.id_type_provider,
      description: 'Ahora también proveedor', reuseAddress: true,
    });
    expect(act.status).toBe(201);
    const res = await request(app).post('/api/postulation').set(h)
      .send({ id_petition: fx.petition.id_petition, proposal: 'Hago el trabajo', cost: 1000 });
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    const created = await models.Postulation.findOne({
      where: { id_petition: fx.petition.id_petition, id_provider: act.body.data.provider.id_provider },
    });
    expect(created).not.toBeNull();
  });

  test('AC-0002-05: un usuario con los dos perfiles no se postula a su propia petición (403) y la cantidad no cambia', async () => {
    const own = await models.Petition.create({
      id_customer: fx.customerE.id_customer, id_type_petition: fx.catalog.typePetition.id_type_petition,
      description: 'Petición de E', id_profession: fx.catalog.profession.id_profession,
      id_type_provider: fx.catalog.typeProvider.id_type_provider, id_state: fx.states.PEN,
      date_since: new Date(), date_until: new Date(Date.now() + 86400000), id_user_create: fx.users.E.id_user,
    });
    const before = await models.Postulation.count({ where: { id_petition: own.id_petition } });
    const res = await postulate(fx.users.E, own.id_petition);
    expect(res.status).toBe(403);
    expect(await models.Postulation.count({ where: { id_petition: own.id_petition } })).toBe(before);
    // y a una petición ajena sí puede
    expect((await postulate(fx.users.E, fx.petition.id_petition)).status).toBeLessThan(300);
  });

  test('B-15: la búsqueda del proveedor corre dentro de la transacción', async () => {
    const spy = jest.spyOn(models.Provider, 'findOne');
    await postulate(fx.users.D, fx.petition.id_petition); // D ya está postulado: 409, pero consulta el Provider antes
    const call = spy.mock.calls.find(([opts]) => opts && opts.where && opts.where.user_id === fx.users.D.id_user);
    spy.mockRestore();
    expect(call).toBeDefined();
    expect(call[0].transaction).toBeDefined();
  });
});
