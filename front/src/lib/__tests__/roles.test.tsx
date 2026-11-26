import { describe, it, expect, beforeEach } from 'vitest';
import {
  deriveCapabilities,
  resolveMode,
  readStoredMode,
  writeStoredMode,
  MODE_STORAGE_KEY,
} from '@/lib/roles';

const customer = { id_customer: 1 };
const provider = { id_provider: 2 };

describe('deriveCapabilities', () => {
  it('AC-0002-13 solo customer -> isCustomer true, isProvider false', () => {
    expect(deriveCapabilities({ customer, provider: null })).toEqual({
      isCustomer: true,
      isProvider: false,
    });
  });

  it('AC-0002-13 con los dos perfiles -> true y true', () => {
    expect(deriveCapabilities({ customer, provider })).toEqual({
      isCustomer: true,
      isProvider: true,
    });
  });

  it('AC-0002-13 sin ningun perfil -> false y false (incluye user nulo)', () => {
    expect(deriveCapabilities({ customer: null, provider: null })).toEqual({
      isCustomer: false,
      isProvider: false,
    });
    expect(deriveCapabilities(null)).toEqual({ isCustomer: false, isProvider: false });
  });

  it('AC-0002-13 no usa role ni is_staff aunque vengan en el objeto', () => {
    const u = { customer, provider: null, role: 'provider', is_staff: true };
    expect(deriveCapabilities(u)).toEqual({ isCustomer: true, isProvider: false });
  });
});

describe('resolveMode', () => {
  const both = { isCustomer: true, isProvider: true };
  it('AC-0002-14 respeta un modo valido', () => {
    expect(resolveMode(both, 'provider')).toBe('provider');
    expect(resolveMode(both, 'customer')).toBe('customer');
  });
  it('AC-0002-15 ignora un modo sin perfil y cae al default', () => {
    expect(resolveMode({ isCustomer: true, isProvider: false }, 'provider')).toBe('customer');
    expect(resolveMode({ isCustomer: false, isProvider: true }, 'customer')).toBe('provider');
    expect(resolveMode(both, 'admin')).toBe('customer');
  });
  it('AC-0002-16 usa el primer candidato valido (URL antes que guardado)', () => {
    expect(resolveMode(both, null, 'provider')).toBe('provider');
    expect(resolveMode(both, 'customer', 'provider')).toBe('customer');
    expect(resolveMode(both, 'admin', 'provider')).toBe('provider');
  });
  it('AC-0002-13 sin perfiles no hay modo', () => {
    expect(resolveMode({ isCustomer: false, isProvider: false }, 'customer')).toBeNull();
  });
});

describe('modo guardado', () => {
  beforeEach(() => localStorage.clear());
  it('AC-0002-16 guarda y lee el modo', () => {
    writeStoredMode('provider');
    expect(localStorage.getItem(MODE_STORAGE_KEY)).toBe('provider');
    expect(readStoredMode()).toBe('provider');
  });
  it('AC-0002-16 ignora valores basura y no revienta si localStorage falla', () => {
    localStorage.setItem(MODE_STORAGE_KEY, 'zzz');
    expect(readStoredMode()).toBeNull();
    const orig = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('bloqueado');
    };
    try {
      expect(readStoredMode()).toBeNull();
    } finally {
      Storage.prototype.getItem = orig;
    }
  });
});
