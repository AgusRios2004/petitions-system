const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0001 T4: catálogos y domicilios solo para superusuario (B-01, B-02)', () => {
  let app;
  let models;
  let fx;

  // Las escrituras de catálogos y los tres GET de /api/addresses.
  const adminRoutes = () => {
    const address = { street: 'Intrusa', number: '1', postal_code: '5500', id_city: fx.catalog.city.id_city };
    const department = {
      name: 'Intruso', id_country: fx.catalog.country.id_country, id_province: fx.catalog.province.id_province,
    };
    return [
      ['post', '/api/category', { name: 'Intrusa' }],
      ['put', `/api/category/${fx.catalog.category.id_category}`, { name: 'Cambiada' }],
      ['delete', `/api/category/${fx.catalog.category.id_category}`],
      ['post', '/api/addresses', address],
      ['put', `/api/addresses/${fx.customerA.address_id}`, address],
      ['delete', `/api/addresses/${fx.customerA.address_id}`],
      ['post', '/api/departments', department],
      ['put', `/api/departments/${fx.catalog.department.id_department}`, { name: 'Cambiado' }],
      ['delete', `/api/departments/${fx.catalog.department.id_department}`],
      ['get', '/api/addresses'],
      ['get', `/api/addresses/${fx.customerA.address_id}`],
      ['get', `/api/addresses/city/${fx.catalog.city.id_city}`],
    ];
  };

  const run = async (headers = {}) => {
    const statuses = {};
    for (const [method, url, body] of adminRoutes()) {
      const req = request(app)[method](url).set(headers);
      statuses[`${method.toUpperCase()} ${url}`] = (await (body ? req.send(body) : req)).status;
    }
    return statuses;
  };

  const expected = (status) => Object.fromEntries(
    adminRoutes().map(([method, url]) => [`${method.toUpperCase()} ${url}`, status]),
  );

  const snapshot = async () => ({
    categories: (await models.Category.findAll({ raw: true, order: ['id_category'] })),
    addresses: (await models.Address.findAll({ raw: true, order: ['id_address'], attributes: ['id_address', 'street'] })),
    departments: (await models.Department.findAll({ raw: true, order: ['id_department'], attributes: ['id_department', 'name'] })),
  });

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0001-04: sin token, las escrituras de catálogos y los GET de /api/addresses responden 401', async () => {
    const before = await snapshot();
    expect(await run()).toEqual(expected(401));
    expect(await snapshot()).toEqual(before);
  });

  test('AC-0001-05: con token de un usuario sin is_superuser responden 403, aunque tenga is_staff', async () => {
    const before = await snapshot();
    // A es cliente; B es proveedor y tiene is_staff (B-05): tampoco pasa.
    expect(await run(await bearer(fx.users.A))).toEqual(expected(403));
    expect(await run(await bearer(fx.users.B))).toEqual(expected(403));
    expect(await snapshot()).toEqual(before);
  });

  test('AC-0001-05: con token de superusuario, POST /api/category responde 2xx', async () => {
    const res = await request(app)
      .post('/api/category')
      .set(await bearer(fx.users.admin))
      .send({ name: 'Electricidad' });
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    expect(await models.Category.count({ where: { name: 'Electricidad' } })).toBe(1);
  });

  test('GET /api/category sigue siendo público (lo usa el registro del front)', async () => {
    const res = await request(app).get('/api/category');
    expect(res.status).toBe(200);
  });
});
