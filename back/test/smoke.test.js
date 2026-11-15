const request = require('supertest');
const { startApp } = require('./helpers/app');

describe('E0 / T-01: infraestructura de tests del back', () => {
  let app;
  let models;

  beforeAll(async () => {
    ({ app, models } = await startApp());
  });

  test('la app levanta contra la base de test y responde en /api/auth/login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@test.local', password: 'x' });

    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.accessToken).toBeUndefined();
  });

  test('la base de test es descartable y no es la de desarrollo', async () => {
    const { sequelize } = models;
    const dialect = sequelize.getDialect();
    if (dialect === 'sqlite') {
      expect(sequelize.options.storage).toBe(process.env.TEST_DB_STORAGE);
    } else {
      expect(sequelize.config.database).toMatch(/_test(_w\d+)?$/);
    }
    expect(await models.User.count()).toBe(0);
  });
});
