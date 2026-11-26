// Fixtures de acceso de la spec 0001.
//
//   A      cliente, dueño de la petición
//   B      proveedor, autor de una postulación a la petición de A
//   C      cliente ajeno: no participa de nada de A ni de B
//   D      segundo proveedor, autor de la otra postulación
//   E      usuario con los dos perfiles (spec 0002): cliente y proveedor
//   admin  superusuario (is_superuser), sin perfil
//
// Una petición de A en PEN con dos postulaciones en PEN (B y D) y una
// conversación A–B. Todo se crea con los modelos, sin pasar por la API.
const PASSWORD = 'Clave-de-test-123';

const STATES = [
  { id_state: 1, state: 'Pendiente', code: 'PEN' },
  { id_state: 2, state: 'Aceptado', code: 'ACE' },
  { id_state: 3, state: 'Rechazado', code: 'REC' },
  { id_state: 4, state: 'Cancelado', code: 'CAN' },
  { id_state: 5, state: 'Baja', code: 'BJA' },
  { id_state: 6, state: 'Finalizado', code: 'FIN' },
];

async function createAccessFixtures(models) {
  const {
    User, State, Category, Profession, TypeProvider, TypePetition, TypeOffer,
    Country, Province, Department, City, Address, Customer, Provider,
    Petition, Postulation, Conversation, ConversationParticipants, Article, Offer,
  } = models;

  const admin = await User.create({
    name: 'Admin', lastname: 'Test', email: 'admin@test.local', password: PASSWORD,
    is_superuser: true, is_active: true, enabled: true,
  });
  const by = { id_user_create: admin.id_user };

  await State.bulkCreate(STATES.map((s) => ({ ...s, ...by })));
  const states = Object.fromEntries(STATES.map((s) => [s.code, s.id_state]));

  const typePetition = await TypePetition.create({ name: 'Servicio', ...by });
  const typeOffer = await TypeOffer.create({ name: 'Promoción', ...by });
  const category = await Category.create({ name: 'Hogar', ...by });
  const profession = await Profession.create({ name: 'Plomero' });
  const typeProvider = await TypeProvider.create({ name: 'Independiente' });

  const country = await Country.create({ name: 'Argentina', code: 'AR', ...by });
  const province = await Province.create({ name: 'Mendoza', id_country: country.id_country, ...by });
  const department = await Department.create({
    name: 'Capital', id_country: country.id_country, id_province: province.id_province,
  });
  const city = await City.create({ name: 'Mendoza Capital', id_department: department.id_department, postal_code: '5500' });

  const newAddress = (street) => Address.create({ street, number: '123', postal_code: '5500', id_city: city.id_city });

  const newCustomer = async (key) => {
    const user = await User.create({
      name: `Cliente${key}`, lastname: 'Test', email: `${key.toLowerCase()}@test.local`,
      password: PASSWORD, is_staff: false, is_active: true, enabled: true,
    });
    const address = await newAddress(`Calle ${key}`);
    const customer = await Customer.create({
      user_id: user.id_user, dni: `3000000${user.id_user}`, phone: `261400${user.id_user}`,
      address_id: address.id_address,
    });
    return { user, customer, address };
  };

  const newProvider = async (key) => {
    // is_staff: true reproduce lo que hace hoy el registro con los proveedores
    // (B-05). Los permisos de esta spec no pueden depender de ese flag.
    const user = await User.create({
      name: `Proveedor${key}`, lastname: 'Test', email: `${key.toLowerCase()}@test.local`,
      password: PASSWORD, is_staff: true, is_active: true, enabled: true,
    });
    const address = await newAddress(`Calle ${key}`);
    const provider = await Provider.create({
      user_id: user.id_user, address_id: address.id_address,
      id_type_provider: typeProvider.id_type_provider, id_profession: profession.id_profession,
      description: `Proveedor ${key}`,
    });
    return { user, provider, address };
  };

  const A = await newCustomer('A');
  const B = await newProvider('B');
  const C = await newCustomer('C');
  const D = await newProvider('D');

  // E: una cuenta con los dos perfiles (spec 0002). Un solo domicilio compartido.
  const userE = await User.create({
    name: 'UsuarioE', lastname: 'Test', email: 'e@test.local',
    password: PASSWORD, is_staff: false, is_active: true, enabled: true,
  });
  const addressE = await newAddress('Calle E');
  const customerE = await Customer.create({
    user_id: userE.id_user, dni: `3000000${userE.id_user}`, phone: `261400${userE.id_user}`,
    address_id: addressE.id_address,
  });
  const providerE = await Provider.create({
    user_id: userE.id_user, address_id: addressE.id_address,
    id_type_provider: typeProvider.id_type_provider, id_profession: profession.id_profession,
    description: 'Proveedor E',
  });

  const petition = await Petition.create({
    id_customer: A.customer.id_customer, id_type_petition: typePetition.id_type_petition,
    description: 'Reparación de cañería (petición de A)', id_profession: profession.id_profession,
    id_type_provider: typeProvider.id_type_provider, id_state: states.PEN,
    date_since: new Date(), date_until: new Date(Date.now() + 7 * 86400000),
    id_user_create: A.user.id_user,
  });

  const newPostulation = (p, cost) => Postulation.create({
    id_petition: petition.id_petition, id_provider: p.provider.id_provider,
    proposal: `Propuesta de ${p.user.name}`, cost, id_state: states.PEN,
    id_user_create: p.user.id_user, winner: false, date_create: new Date(),
  });
  const postulationB = await newPostulation(B, 5000);
  const postulationD = await newPostulation(D, 6000);

  const conversation = await Conversation.create({ petition_id: petition.id_petition });
  await ConversationParticipants.bulkCreate([
    { conversation_id: conversation.id_conversation, user_id: A.user.id_user },
    { conversation_id: conversation.id_conversation, user_id: B.user.id_user },
  ]);

  // Datos para recorrer los GET públicos de AC-0001-01.
  const article = await Article.create({
    name: 'Caño de PVC', id_category: category.id_category,
    id_user_create: admin.id_user, id_user_update: admin.id_user,
  });
  const offer = await Offer.create({
    id_type_offer: typeOffer.id_type_offer, name: 'Oferta de B', description: 'Descuento',
    date_open: new Date(), date_close: new Date(Date.now() + 86400000), status: 'active',
    id_provider: B.provider.id_provider, user_create_id: B.user.id_user, user_update_id: B.user.id_user,
  });

  return {
    password: PASSWORD,
    states,
    users: { A: A.user, B: B.user, C: C.user, D: D.user, E: userE, admin },
    customerA: A.customer,
    customerC: C.customer,
    customerE,
    providerE,
    providerB: B.provider,
    providerD: D.provider,
    petition,
    postulationB,
    postulationD,
    conversation,
    catalog: { typePetition, typeOffer, category, profession, typeProvider, country, province, department, city },
    article,
    offer,
  };
}

module.exports = { createAccessFixtures, PASSWORD };
