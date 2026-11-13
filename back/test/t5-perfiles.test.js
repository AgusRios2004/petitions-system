const request = require('supertest');
const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer } = require('./helpers/auth');

describe('spec 0001 T5: perfiles solo para el dueño (B-02)', () => {
  let app;
  let models;
  let fx;
  let idA;
  let idProvB;

  const customerRow = (id) => models.Customer.findByPk(id, { raw: true });
  const providerRow = (id) => models.Provider.findByPk(id, { raw: true });
  const addressRow = (id) => models.Address.findByPk(id, { raw: true, attributes: ['id_address', 'street', 'number'] });

  beforeAll(async () => {
    ({ app, models } = await startApp());
    fx = await createAccessFixtures(models);
    idA = fx.customerA.id_customer;
    idProvB = fx.providerB.id_provider;
  });

  test('AC-0001-04: sin token, PUT /api/customer/:id y PUT /api/provider/:id responden 401 (y GET /api/customer/:id también)', async () => {
    const customerBefore = await customerRow(idA);
    const providerBefore = await providerRow(idProvB);

    const putCustomer = await request(app).put(`/api/customer/${idA}`).send({ phone: '000' });
    const putProvider = await request(app).put(`/api/provider/${idProvB}`).send({ description: 'pwn' });
    const getCustomer = await request(app).get(`/api/customer/${idA}`);

    expect([putCustomer.status, putProvider.status, getCustomer.status]).toEqual([401, 401, 401]);
    expect(await customerRow(idA)).toEqual(customerBefore);
    expect(await providerRow(idProvB)).toEqual(providerBefore);
  });

  test('AC-0001-06: GET /api/customer/:idA con token de B responde 403; con token de A, 200', async () => {
    const asB = await request(app).get(`/api/customer/${idA}`).set(await bearer(fx.users.B));
    expect(asB.status).toBe(403);
    expect(asB.body.data).toBeUndefined();

    const asC = await request(app).get(`/api/customer/${idA}`).set(await bearer(fx.users.C));
    expect(asC.status).toBe(403);

    const asA = await request(app).get(`/api/customer/${idA}`).set(await bearer(fx.users.A));
    expect(asA.status).toBe(200);
    expect(asA.body.data.id_customer).toBe(idA);
    expect(asA.body.data.user.email).toBe(fx.users.A.email);
  });

  test('AC-0001-07: PUT de perfil ajeno responde 403 y el perfil no cambia; el dueño, 200', async () => {
    const customerBefore = await customerRow(idA);
    const addressBefore = await addressRow(customerBefore.address_id);
    const providerBefore = await providerRow(idProvB);

    // B (proveedor) y C (otro cliente) contra el perfil de cliente de A.
    for (const intruder of [fx.users.B, fx.users.C]) {
      const res = await request(app)
        .put(`/api/customer/${idA}`)
        .set(await bearer(intruder))
        .send({ phone: '999', dni: '999', address: { street: 'Pwn', number: '9', postal_code: '1', id_city: fx.catalog.city.id_city } });
      expect(res.status).toBe(403);
    }
    // A (cliente) y D (otro proveedor) contra el perfil de proveedor de B.
    for (const intruder of [fx.users.A, fx.users.D]) {
      const res = await request(app)
        .put(`/api/provider/${idProvB}`)
        .set(await bearer(intruder))
        .send({ description: 'pwn' });
      expect(res.status).toBe(403);
    }

    // GET posterior: el perfil sigue igual.
    const getA = await request(app).get(`/api/customer/${idA}`).set(await bearer(fx.users.A));
    expect(getA.body.data.phone).toBe(customerBefore.phone);
    expect(getA.body.data.dni).toBe(customerBefore.dni);
    expect(getA.body.data.address.street).toBe(addressBefore.street);
    const getB = await request(app).get(`/api/provider/${idProvB}`);
    expect(getB.body.data.description).toBe(providerBefore.description);
    expect(await customerRow(idA)).toEqual(customerBefore);
    expect(await providerRow(idProvB)).toEqual(providerBefore);

    // Los dueños sí pueden, con el mismo contrato que usa el front.
    const ownCustomer = await request(app)
      .put(`/api/customer/${idA}`)
      .set(await bearer(fx.users.A))
      .send({
        dni: '30111222', phone: '2615550000',
        address: { id_address: customerBefore.address_id, street: 'Calle Nueva', number: '456', postal_code: '5500', id_city: fx.catalog.city.id_city },
      });
    expect(ownCustomer.status).toBe(200);
    expect(ownCustomer.body.data.phone).toBe('2615550000');
    expect((await addressRow(customerBefore.address_id)).street).toBe('Calle Nueva');

    const ownProvider = await request(app)
      .put(`/api/provider/${idProvB}`)
      .set(await bearer(fx.users.B))
      .send({ description: 'Descripción nueva', id_type_provider: providerBefore.id_type_provider });
    expect(ownProvider.status).toBe(200);
    expect((await providerRow(idProvB)).description).toBe('Descripción nueva');
  });

  test('AC-0001-08: PUT del dueño con user_id distinto en el body responde 200 y user_id queda igual', async () => {
    const res = await request(app)
      .put(`/api/customer/${idA}`)
      .set(await bearer(fx.users.A))
      .send({ phone: '2614440000', user_id: fx.users.C.id_user, id_customer: 999 });
    expect(res.status).toBe(200);

    const row = await customerRow(idA);
    expect(row.user_id).toBe(fx.users.A.id_user);
    expect(row.id_customer).toBe(idA);
    expect(row.phone).toBe('2614440000');
    expect(await customerRow(999)).toBeNull();

    const prov = await request(app)
      .put(`/api/provider/${idProvB}`)
      .set(await bearer(fx.users.B))
      .send({ description: 'Otra', user_id: fx.users.D.id_user, id_provider: 999 });
    expect(prov.status).toBe(200);
    expect((await providerRow(idProvB)).user_id).toBe(fx.users.B.id_user);
  });

  test('AC-0001-07 (borde): la dirección del body no permite editar un domicilio ajeno', async () => {
    const addressOfC = await addressRow(fx.customerC.address_id);
    const res = await request(app)
      .put(`/api/customer/${idA}`)
      .set(await bearer(fx.users.A))
      .send({ address: { id_address: fx.customerC.address_id, street: 'Pisada', number: '1', postal_code: '5500', id_city: fx.catalog.city.id_city } });
    expect(res.status).toBe(200);
    expect(await addressRow(fx.customerC.address_id)).toEqual(addressOfC);
    // Se actualizó el domicilio propio, no el del body.
    const row = await customerRow(idA);
    expect(row.address_id).not.toBe(fx.customerC.address_id);
    expect((await addressRow(row.address_id)).street).toBe('Pisada');
  });

  test('AC-0001-07 (borde): body vacío o solo con campos no permitidos responde 400 y nada cambia', async () => {
    const before = await customerRow(idA);
    const headers = await bearer(fx.users.A);
    for (const body of [{}, { user_id: fx.users.C.id_user }, { id_customer: 5, otra: 'cosa' }]) {
      const res = await request(app).put(`/api/customer/${idA}`).set(headers).send(body);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/No se proporcionaron datos para actualizar/);
    }
    const prov = await request(app).put(`/api/provider/${idProvB}`).set(await bearer(fx.users.B)).send({ user_id: 1 });
    expect(prov.status).toBe(400);
    expect(await customerRow(idA)).toEqual(before);
  });

  test('AC-0001-06 (borde): id inexistente o no numérico responde 404; el superusuario no saltea la verificación de dueño', async () => {
    const headersA = await bearer(fx.users.A);
    const headersAdmin = await bearer(fx.users.admin);

    expect((await request(app).get('/api/customer/99999').set(headersA)).status).toBe(404);
    expect((await request(app).get('/api/customer/abc').set(headersA)).status).toBe(404);
    expect((await request(app).put('/api/customer/99999').set(headersA).send({ phone: '1' })).status).toBe(404);
    expect((await request(app).put('/api/customer/abc').set(headersA).send({ phone: '1' })).status).toBe(404);
    expect((await request(app).put('/api/provider/99999').set(headersA).send({ description: 'x' })).status).toBe(404);
    expect((await request(app).put('/api/provider/abc').set(headersA).send({ description: 'x' })).status).toBe(404);

    const before = await customerRow(idA);
    expect((await request(app).get(`/api/customer/${idA}`).set(headersAdmin)).status).toBe(403);
    expect((await request(app).put(`/api/customer/${idA}`).set(headersAdmin).send({ phone: '1' })).status).toBe(403);
    expect((await request(app).put(`/api/provider/${idProvB}`).set(headersAdmin).send({ description: 'x' })).status).toBe(403);
    expect(await customerRow(idA)).toEqual(before);
  });
});
