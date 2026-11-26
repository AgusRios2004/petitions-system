const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures, PASSWORD } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0002 T2: identidad sin is_staff, roles derivados de los perfiles', () => {
  let app;
  let models;
  let fx;

  const address = () => ({ street: 'Calle Reg', number: '1', postal_code: '5500', id_city: fx.catalog.city.id_city });
  const base = (email) => ({ name: 'Nuevo', lastname: 'Reg', email, password: PASSWORD, address: address() });

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0002-01: registrar un cliente y un proveedor deja is_staff = false en los dos', async () => {
    const c = await request(app).post('/api/auth/register')
      .send({ ...base('reg-c@test.local'), role: 'customer', dni: '111', phone: '222' });
    const p = await request(app).post('/api/auth/register').send({
      ...base('reg-p@test.local'), role: 'provider', description: 'x',
      professionId: fx.catalog.profession.id_profession, typeProviderId: fx.catalog.typeProvider.id_type_provider,
    });
    expect(c.status).toBe(200);
    expect(p.status).toBe(200);
    for (const email of ['reg-c@test.local', 'reg-p@test.local']) {
      // unscoped: is_staff ya no sale en las consultas comunes (T8), pero la columna sigue en la base.
      const u = await models.User.unscoped().findOne({ where: { email } });
      expect(u.is_staff).toBe(false);
    }
  });

  test('AC-0002-02: el login devuelve roles según los perfiles (cliente, proveedor, ambos)', async () => {
    const cases = [
      [fx.users.A, { customer: true, provider: false }],
      [fx.users.B, { customer: false, provider: true }],
      [fx.users.E, { customer: true, provider: true }],
      [fx.users.admin, { customer: false, provider: false }],
    ];
    for (const [user, roles] of cases) {
      const res = await request(app).post('/api/auth/login').send({ email: user.email, password: PASSWORD });
      expect(res.status).toBe(200);
      expect(res.body.user.roles).toEqual(roles);
    }
  });

  test('AC-0002-02: GET /api/profile/me devuelve roles según los perfiles', async () => {
    const cases = [
      [fx.users.A, { customer: true, provider: false }],
      [fx.users.B, { customer: false, provider: true }],
      [fx.users.E, { customer: true, provider: true }],
    ];
    for (const [user, roles] of cases) {
      const res = await request(app).get('/api/profile/me').set(await bearer(user));
      expect(res.status).toBe(200);
      expect(res.body.data.roles).toEqual(roles);
    }
  });

  test('AC-0002-02: loadProfiles deja req.customer y req.provider (o null) después de authRequired', async () => {
    const { loadProfiles } = require('../middlewares/auth');
    const run = async (user) => {
      const req = { user: { sub: user.id_user } };
      await new Promise((resolve, reject) => loadProfiles(req, {}, (e) => (e ? reject(e) : resolve())));
      return req;
    };
    const a = await run(fx.users.A);
    expect(a.customer.id_customer).toBe(fx.customerA.id_customer);
    expect(a.provider).toBeNull();
    const e = await run(fx.users.E);
    expect(e.customer).not.toBeNull();
    expect(e.provider.id_provider).toBe(fx.providerE.id_provider);
    const admin = await run(fx.users.admin);
    expect([admin.customer, admin.provider]).toEqual([null, null]);
  });
});
