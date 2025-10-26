export const STATUS_TABS = [
  { label: 'Pendientes', value: 3 },
  { label: 'Aceptadas', value: 1 },
  { label: 'Rechazadas', value: 2 },
  { label: 'Finalizadas', value: 7 },
];

// 🎨 Define colores consistentes para cada estado del sistema
export const getStatusColor = (statusName: string) => {
  if (!statusName) {
    return 'bg-gray-400/10 text-gray-500 ring-1 ring-inset ring-gray-400/20';
  }

  switch (statusName.toLowerCase()) {
    case 'abierta':
      return 'bg-sky-400/10 text-sky-400 ring-1 ring-inset ring-sky-400/20';
    case 'en progreso':
      return 'bg-amber-400/10 text-amber-400 ring-1 ring-inset ring-amber-400/20';
    case 'finalizada':
      return 'bg-emerald-400/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/20';
    case 'cancelada':
      return 'bg-rose-400/10 text-rose-400 ring-1 ring-inset ring-rose-400/20';
    case 'aceptado':
      return 'bg-emerald-400/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/20';
    case 'pendiente':
      return 'bg-amber-400/10 text-amber-400 ring-1 ring-inset ring-amber-400/20';
    case 'rechazado':
      return 'bg-rose-400/10 text-rose-400 ring-1 ring-inset ring-rose-400/20';
    case 'activo':
        return 'bg-sky-400/10 text-sky-400 ring-1 ring-inset ring-sky-400/20';
    default:
      return 'bg-gray-400/10 text-gray-400 ring-1 ring-inset ring-gray-400/20';
  }
};
