// Capacidades del usuario derivadas de los perfiles que tiene (spec 0002).
// Nunca se lee `role` ni `is_staff`: el rol lo da el perfil.

export type Mode = 'customer' | 'provider';

export interface Capabilities {
  isCustomer: boolean;
  isProvider: boolean;
}

export const MODE_STORAGE_KEY = 'profile_mode';

export function deriveCapabilities(
  user: { customer?: unknown; provider?: unknown } | null | undefined,
): Capabilities {
  return {
    isCustomer: Boolean(user?.customer),
    isProvider: Boolean(user?.provider),
  };
}

function isMode(value: unknown): value is Mode {
  return value === 'customer' || value === 'provider';
}

function isAllowed(caps: Capabilities, mode: unknown): mode is Mode {
  return (
    (mode === 'customer' && caps.isCustomer) || (mode === 'provider' && caps.isProvider)
  );
}

/**
 * Primer candidato que el usuario puede usar; si ninguno sirve, `customer`
 * (o `provider` si es lo unico que tiene). Sin perfiles: null.
 */
export function resolveMode(
  caps: Capabilities,
  ...candidates: Array<string | null | undefined>
): Mode | null {
  for (const c of candidates) {
    if (isAllowed(caps, c)) return c;
  }
  if (caps.isCustomer) return 'customer';
  if (caps.isProvider) return 'provider';
  return null;
}

export function readStoredMode(): Mode | null {
  try {
    const v = localStorage.getItem(MODE_STORAGE_KEY);
    return isMode(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeStoredMode(mode: Mode): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // preferencia del navegador: si no se puede guardar, no pasa nada
  }
}

export function clearStoredMode(): void {
  try {
    localStorage.removeItem(MODE_STORAGE_KEY);
  } catch {
    // idem
  }
}
