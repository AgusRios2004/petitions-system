const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0002 T4: activar el segundo perfil', () => {
  let app;
  let models;
  let fx;

  const newAddress = () => ({ street: 'Calle Nueva', number: '9', postal_code: '5500', id_city: fx.catalog.city.id_city });
  const providerBody = (extra = {}) => ({
    id_profession: fx.catalog.profession.id_profession,
    id_type_provider: fx.catalog.typeProvider.id_type_provider,
    description: 'Plomero nuevo',
    address: newAddress(),
    ...extra,
  });
  const activate = async (kind, user, body) =>
    request(app).post(`/api/profile/me/${kind}`).set(await bearer(user)).send(body);
  const me = async (user) => request(app).get('/api/profile/me').set(await bearer(user));
  const count = (model, user) => models[model].count({ where: { user_id: user.id_user } });

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0002-03: un cliente activa su perfil de proveedor (201) y /profile/me con el mismo token devuelve roles.provider = true', async () => {
    const before = await me(fx.users.C);
    expect(before.body.data.roles.provider).toBe(false);
    const res = await activate('provider', fx.users.C, providerBody());
    expect(res.status).toBe(201);
    expect(res.body.data.roles).toEqual({ customer: true, provider: true });
    expect(res.body.data.provider.user_id).toBe(fx.users.C.id_user);
    const after = await me(fx.users.C);
    expect(after.body.data.roles.provider).toBe(true);
    expect(after.body.data.provider.id_provider).toBe(res.body.data.provider.id_provider);
    expect(JSON.stringify(res.body)).not.toContain('password');
  });

  test('AC-0002-08: activar cliente sin dni o sin phone responde 400 y no crea nada', async () => {
    const addresses = await models.Address.count();
    for (const body of [{ phone: '1', address: newAddress() }, { dni: '1', address: newAddress() }, {}]) {
      const res = await activate('customer', fx.users.D, body);
      expect(res.status).toBe(400);
    }
    expect(await count('Customer', fx.users.D)).toBe(0);
    expect(await models.Address.count()).toBe(addresses);
  });

  test('AC-0002-08 (borde): activar proveedor con el body vacío responde 400 y no crea nada', async () => {
    const res = await activate('provider', fx.users.A, {});
    expect(res.status).toBe(400);
    expect(await count('Provider', fx.users.A)).toBe(0);
  });

  test('AC-0002-08 (borde): reuseAddress sin un perfil previo con domicilio responde 400 y no crea nada', async () => {
    const res = await activate('customer', fx.users.admin, { dni: '1', phone: '2', reuseAddress: true });
    expect(res.status).toBe(400);
    expect(await count('Customer', fx.users.admin)).toBe(0);
  });

  test('AC-0002-08: con reuseAddress:true, un proveedor activa cliente (201) y el address_id es el del proveedor', async () => {
    const addresses = await models.Address.count();
    const res = await activate('customer', fx.users.B, { dni: '123', phone: '456', reuseAddress: true });
    expect(res.status).toBe(201);
    expect(res.body.data.roles).toEqual({ customer: true, provider: true });
    expect(res.body.data.customer.address_id).toBe(fx.providerB.address_id);
    expect(await models.Address.count()).toBe(addresses);
  });

  test('AC-0002-06: activar un perfil que ya existe responde 409 y sigue habiendo una sola fila (y ningún domicilio nuevo)', async () => {
    const addresses = await models.Address.count();
    const p = await activate('provider', fx.users.E, providerBody());
    const c = await activate('customer', fx.users.E, { dni: '1', phone: '2', address: newAddress() });
    expect(p.status).toBe(409);
    expect(c.status).toBe(409);
    expect(await count('Provider', fx.users.E)).toBe(1);
    expect(await count('Customer', fx.users.E)).toBe(1);
    expect(await models.Address.count()).toBe(addresses);
  });

  test('AC-0002-06 (borde): dos activaciones simultáneas del mismo perfil: una 201 y una 409, una sola fila', async () => {
    const h = await bearer(fx.users.D);
    const send = () => request(app).post('/api/profile/me/customer').set(h)
      .send({ dni: '9', phone: '9', address: newAddress() });
    const results = await Promise.all([send(), send()]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(await count('Customer', fx.users.D)).toBe(1);
  });

  test('AC-0002-06 (borde): si la creación del perfil falla, hace rollback y no queda domicilio huérfano; responde 500 sin detalle', async () => {
    const addresses = await models.Address.count();
    const spy = jest.spyOn(models.Provider, 'create').mockRejectedValue(new Error('ECONNREFUSED 10.0.0.9 secreto'));
    const res = await activate('provider', fx.users.A, providerBody());
    spy.mockRestore();
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('secreto');
    expect(await models.Address.count()).toBe(addresses);
    expect(await count('Provider', fx.users.A)).toBe(0);
  });

  test('AC-0002-03: sin token responde 401', async () => {
    expect((await request(app).post('/api/profile/me/provider').send(providerBody())).status).toBe(401);
    expect((await request(app).post('/api/profile/me/customer').send({ dni: '1', phone: '1' })).status).toBe(401);
  });
});
