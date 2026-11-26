const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0003 T2: editar solo el autor, con campos permitidos y validación (B-30)', () => {
  let app;
  let models;
  let fx;
  let article2;

  const row = (p) => models.Postulation.findByPk(p.id_postulation, { raw: true });
  const inventory = async (p) =>
    (await models.Inventory.findAll({ where: { id_postulation: p.id_postulation }, raw: true, order: [['id_article', 'ASC']] }))
      .map((i) => ({ id_article: i.id_article, quantity: Number(i.quantity), cost: Number(i.cost) }));
  const put = async (user, p, body) =>
    request(app).put(`/api/postulation/${p.id_postulation}`).set(await bearer(user)).send(body);
  const setState = (p, code) =>
    models.Postulation.update({ id_state: fx.states[code] }, { where: { id_postulation: p.id_postulation } });

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
    article2 = await models.Article.create({
      name: 'Codo de PVC', id_category: fx.catalog.category.id_category,
      id_user_create: fx.users.admin.id_user, id_user_update: fx.users.admin.id_user,
    });
    // Inventario inicial de B: un artículo.
    await models.Inventory.create({
      id_article: fx.article.id_article, quantity: 3, cost: 100,
      id_postulation: fx.postulationB.id_postulation, id_user_create: fx.users.B.id_user, date_create: new Date(),
    });
  });

  test('AC-0003-01: PUT con token de D, A, C y superusuario responde 403 y no cambia nada', async () => {
    const before = await row(fx.postulationB);
    const invBefore = await inventory(fx.postulationB);
    for (const intruder of [fx.users.D, fx.users.A, fx.users.C, fx.users.admin]) {
      const res = await put(intruder, fx.postulationB, { proposal: 'hackeada', cost: 1, articles: [] });
      expect(res.status).toBe(403);
    }
    const after = await row(fx.postulationB);
    expect(after.proposal).toBe(before.proposal);
    expect(Number(after.cost)).toBe(Number(before.cost));
    expect(await inventory(fx.postulationB)).toEqual(invBefore);
  });

  test('AC-0003-02: PUT de B guarda proposal, cost y dos articles, e id_user_update sale del token', async () => {
    const res = await put(fx.users.B, fx.postulationB, {
      proposal: 'Nueva propuesta', cost: 7000, id_user_update: fx.users.D.id_user,
      articles: [
        { id_article: fx.article.id_article, quantity: 2, cost: 150 },
        { id_article: article2.id_article, quantity: 4, cost: 50.5 },
      ],
    });
    expect(res.status).toBe(200);
    const after = await row(fx.postulationB);
    expect(after.proposal).toBe('Nueva propuesta');
    expect(Number(after.cost)).toBe(7000);
    expect(after.id_user_update).toBe(fx.users.B.id_user);
    expect(await inventory(fx.postulationB)).toEqual([
      { id_article: fx.article.id_article, quantity: 2, cost: 150 },
      { id_article: article2.id_article, quantity: 4, cost: 50.5 },
    ]);
  });

  test('AC-0003-03: id_state, winner, id_provider e id_petition del body se ignoran', async () => {
    const before = await row(fx.postulationB);
    const res = await put(fx.users.B, fx.postulationB, {
      proposal: 'Otra más', id_state: fx.states.ACE, winner: true,
      id_provider: fx.providerD.id_provider, id_petition: 99999,
    });
    expect(res.status).toBe(200);
    const after = await row(fx.postulationB);
    expect(after.id_state).toBe(before.id_state);
    expect(Boolean(after.winner)).toBe(Boolean(before.winner));
    expect(after.id_provider).toBe(before.id_provider);
    expect(after.id_petition).toBe(before.id_petition);
  });

  test('AC-0003-04: sin articles el inventario queda igual; con articles: [] queda vacío', async () => {
    const inv = await inventory(fx.postulationB);
    expect(inv.length).toBe(2);
    expect((await put(fx.users.B, fx.postulationB, { proposal: 'Sin articles' })).status).toBe(200);
    expect(await inventory(fx.postulationB)).toEqual(inv);
    expect((await put(fx.users.B, fx.postulationB, { articles: [] })).status).toBe(200);
    expect(await inventory(fx.postulationB)).toEqual([]);
  });

  test('AC-0003-05: cost negativo o no numérico, quantity 0 o no entera, id_article inexistente o proposal vacío responden 400 sin cambios', async () => {
    await put(fx.users.B, fx.postulationB, {
      proposal: 'Base', cost: 5000, articles: [{ id_article: fx.article.id_article, quantity: 1, cost: 10 }],
    });
    const before = await row(fx.postulationB);
    const invBefore = await inventory(fx.postulationB);
    const good = { id_article: fx.article.id_article, quantity: 1, cost: 10 };
    const bodies = [
      { proposal: 'Mala', cost: -1 },
      { proposal: 'Mala', cost: 'abc' },
      { proposal: '   ', cost: 10 },
      { proposal: 'Mala', articles: [good, { ...good, quantity: 0 }] },
      { proposal: 'Mala', articles: [good, { ...good, quantity: 1.5 }] },
      { proposal: 'Mala', articles: [good, { ...good, cost: -5 }] },
      { proposal: 'Mala', articles: [good, { ...good, id_article: 99999 }] },
    ];
    for (const body of bodies) {
      const res = await put(fx.users.B, fx.postulationB, body);
      expect(res.status).toBe(400);
    }
    const after = await row(fx.postulationB);
    expect(after.proposal).toBe(before.proposal);
    expect(Number(after.cost)).toBe(Number(before.cost));
    expect(await inventory(fx.postulationB)).toEqual(invBefore);
  });

  test('AC-0003-06: PUT de B sobre su postulación en ACE responde 409 sin cambios; id inexistente responde 404', async () => {
    const before = await row(fx.postulationB);
    await setState(fx.postulationB, 'ACE');
    try {
      const res = await put(fx.users.B, fx.postulationB, { proposal: 'Tardía' });
      expect(res.status).toBe(409);
      expect((await row(fx.postulationB)).proposal).toBe(before.proposal);
    } finally {
      await setState(fx.postulationB, 'PEN');
    }
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const res = await request(app).put('/api/postulation/99999').set(await bearer(fx.users.B)).send({ proposal: 'x' });
      expect(res.status).toBe(404);
    } finally {
      quiet.mockRestore();
    }
  });

  test('AC-0003-01 (borde): usuario sin perfil de proveedor responde 403; body vacío del autor responde 200', async () => {
    expect((await put(fx.users.C, fx.postulationB, {})).status).toBe(403);
    const before = await row(fx.postulationB);
    const res = await put(fx.users.B, fx.postulationB, {});
    expect(res.status).toBe(200);
    const after = await row(fx.postulationB);
    expect(after.proposal).toBe(before.proposal);
    expect(after.id_user_update).toBe(fx.users.B.id_user);
  });
});
