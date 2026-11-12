const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');

describe('spec 0001 T3: endpoints muertos (B-02, B-23)', () => {
  let app;
  let models;

  beforeAll(async () => {
    ({ app, models } = await startApp());
    await createAccessFixtures(models);
  });

  test('AC-0001-03: los endpoints muertos responden 404 y no crean nada', async () => {
    const usersBefore = await models.User.count();
    const customersBefore = await models.Customer.count();
    const providersBefore = await models.Provider.count();

    const registro = {
      name: 'Intruso', lastname: 'Test', email: 'intruso@test.local', password: 'x12345678',
      dni: '1', phone: '1', isStaff: true, description: 'x',
    };
    const calls = [
      ['GET /api/customer', request(app).get('/api/customer')],
      ['POST /api/customer', request(app).post('/api/customer').send({ userId: 1, dni: '1', phone: '1' })],
      ['POST /api/customer/register', request(app).post('/api/customer/register').send(registro)],
      ['POST /api/provider', request(app).post('/api/provider').send({ user_id: 1 })],
      ['POST /api/provider/register', request(app).post('/api/provider/register').send({ ...registro, email: 'intruso2@test.local' })],
      ['POST /api/profile', request(app).post('/api/profile').send({ id_user: 1, role: 'both' })],
    ];

    const statuses = {};
    for (const [name, req] of calls) statuses[name] = (await req).status;

    expect(statuses).toEqual(Object.fromEntries(calls.map(([name]) => [name, 404])));
    expect(await models.User.count()).toBe(usersBefore);
    expect(await models.Customer.count()).toBe(customersBefore);
    expect(await models.Provider.count()).toBe(providersBefore);
  });
});
