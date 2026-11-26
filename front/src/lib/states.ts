// Ids de los estados según el seed (back/scripts/seed.js).
export const POSTULATION_STATE = {
  PEN: 1,
  ACE: 2,
  REC: 3,
  CAN: 4,
  BJA: 5,
  FIN: 6,
} as const;

// Estados por los que el proveedor dueño puede filtrar su historial.
export const POSTULATION_FILTER_OPTIONS = [
  { value: POSTULATION_STATE.PEN, label: 'Pendiente' },
  { value: POSTULATION_STATE.ACE, label: 'Aceptado' },
  { value: POSTULATION_STATE.REC, label: 'Rechazado' },
  { value: POSTULATION_STATE.FIN, label: 'Finalizado' },
] as const;
