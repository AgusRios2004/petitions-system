const request = require('supertest');
const { startApp, startServer } = require('./helpers/app');
const { createAccessFixtures } = require('./helpers/fixtures');
const { bearer, socketAs } = require('./helpers/auth');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('spec 0001 T9: salas de chat solo para participantes (B-04)', () => {
  let app;
  let io;
  let fx;
  let room;

  const inRoom = async (socket, name) => (await io.in(name).fetchSockets()).some((s) => s.id === socket.id);
  const waitUntil = async (fn, ms = 1500) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (await fn()) return true;
      await sleep(25);
    }
    return false;
  };
  const collect = (socket) => {
    const received = [];
    socket.on('newMessage', (m) => received.push(m));
    return received;
  };

  beforeAll(async () => {
    const started = await startApp();
    app = started.app;
    ({ io } = await startServer());
    fx = await createAccessFixtures(started.models);
    room = `conversation:${fx.conversation.id_conversation}`;
  });

  test('AC-0001-15: C (no participante) emite joinConversation: no recibe newMessage en 500 ms y B sí', async () => {
    const socketB = await socketAs(fx.users.B);
    const socketC = await socketAs(fx.users.C);
    const receivedB = collect(socketB);
    const receivedC = collect(socketC);
    expect(await waitUntil(() => inRoom(socketB, room))).toBe(true); // B entra solo, por ser participante

    socketC.emit('joinConversation', room);
    await sleep(300);
    expect(await inRoom(socketC, room)).toBe(false);

    const res = await request(app)
      .post('/api/message')
      .set(await bearer(fx.users.A))
      .send({ idConversation: fx.conversation.id_conversation, content: 'hola B' });
    expect(res.status).toBe(201);

    await waitUntil(() => receivedB.length > 0, 500);
    await sleep(500);
    expect(receivedC).toHaveLength(0);
    expect(receivedB).toHaveLength(1);
    expect(receivedB[0].content).toBe('hola B');
  });

  test('AC-0001-15 (borde): un participante que emite joinConversation sí entra', async () => {
    const socketA = await socketAs(fx.users.A);
    expect(await waitUntil(() => inRoom(socketA, room))).toBe(true);
    socketA.emit('leaveConversation', room);
    expect(await waitUntil(async () => !(await inRoom(socketA, room)))).toBe(true);
    socketA.emit('joinConversation', room);
    expect(await waitUntil(() => inRoom(socketA, room))).toBe(true);
  });

  test('AC-0001-15 (borde): nombres de sala que no respetan conversation:<id> se ignoran', async () => {
    const socketC = await socketAs(fx.users.C);
    const id = fx.conversation.id_conversation;
    const names = ['conversation:abc', `conversation:${id}:x`, `conversation: ${id}`, `Conversation:${id}`, 'otra-sala', `conversation:${id}.0`, '', null, 42, { a: 1 }, `conversation:99999`];
    names.forEach((n) => socketC.emit('joinConversation', n));
    socketC.emit('joinConversation'); // sin argumento
    await sleep(400);
    const joined = [...(await io.fetchSockets()).find((s) => s.id === socketC.id).rooms].filter((r) => r !== socketC.id);
    expect(joined).toEqual([]);
  });
});
