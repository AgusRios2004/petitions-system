const { startApp } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { loginAs, socketAs } = require('./helpers/auth');

describe('spec 0001 T1: fixtures de acceso', () => {
  let models;
  let fx;

  beforeAll(async () => {
    ({ models } = await startApp());
    fx = await createAccessFixtures(models);
  });

  test('los fixtures se crean: A, B, C y superusuario; petición de A en PEN con dos postulaciones; conversación A–B', async () => {
    const { Petition, Postulation, ConversationParticipants, User } = models;

    expect(await User.count()).toBe(6);
    expect(fx.users.admin.is_superuser).toBe(true);

    const petition = await Petition.findByPk(fx.petition.id_petition);
    expect(petition.id_customer).toBe(fx.customerA.id_customer);
    expect(petition.id_state).toBe(fx.states.PEN);

    const postulations = await Postulation.findAll({ where: { id_petition: petition.id_petition } });
    expect(postulations).toHaveLength(2);
    expect(postulations.map((p) => p.id_provider)).toContain(fx.providerB.id_provider);
    expect(postulations.every((p) => p.id_state === fx.states.PEN && p.winner === false)).toBe(true);

    const participants = await ConversationParticipants.findAll({
      where: { conversation_id: fx.conversation.id_conversation },
    });
    expect(participants.map((p) => p.user_id).sort()).toEqual([fx.users.A.id_user, fx.users.B.id_user].sort());
  });

  test('cada usuario puede loguearse con loginAs', async () => {
    for (const user of Object.values(fx.users)) {
      const token = await loginAs(user);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    }
  });

  test('socketAs conecta un socket autenticado', async () => {
    const socket = await socketAs(fx.users.A);
    expect(socket.connected).toBe(true);
  });
});
