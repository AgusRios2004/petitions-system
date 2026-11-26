// Se lee la lista de estados del seed sin ejecutarlo: el seed borra la base.
describe('spec 0004 T1: el seed define el estado FIN', () => {
  test('AC-0004-06: STATES incluye FIN con id_state 6, sin ejecutar el seed al hacer require', () => {
    const { STATES } = require('../scripts/seed');
    const fin = STATES.find((s) => s.code === 'FIN');
    expect(fin).toBeDefined();
    expect(fin.id_state).toBe(6);
    expect(fin.state).toBe('Finalizado');
    expect(STATES.map((s) => s.id_state)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
