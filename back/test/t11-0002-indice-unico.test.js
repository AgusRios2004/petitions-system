const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');

describe('spec 0002 T1: un perfil de cada tipo por usuario', () => {
  let models;
  let fx;

  beforeAll(async () => {
    ({ models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('AC-0002-07: un segundo Customer con el mismo user_id falla con SequelizeUniqueConstraintError', async () => {
    await expect(models.Customer.create({ user_id: fx.users.A.id_user, dni: '1', phone: '1' }))
      .rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' });
    expect(await models.Customer.count({ where: { user_id: fx.users.A.id_user } })).toBe(1);
  });

  test('AC-0002-07: un segundo Provider con el mismo user_id falla con SequelizeUniqueConstraintError', async () => {
    await expect(models.Provider.create({ user_id: fx.users.B.id_user, description: 'otro' }))
      .rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' });
    expect(await models.Provider.count({ where: { user_id: fx.users.B.id_user } })).toBe(1);
  });

  test('AC-0002-07 (fixture): E tiene un Customer y un Provider', async () => {
    expect(fx.users.E).toBeDefined();
    expect(await models.Customer.count({ where: { user_id: fx.users.E.id_user } })).toBe(1);
    expect(await models.Provider.count({ where: { user_id: fx.users.E.id_user } })).toBe(1);
  });
});
