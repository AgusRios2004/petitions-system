import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readStoredMode, writeStoredMode, deriveCapabilities, resolveMode } from '@/lib/roles';

// --- mocks ---
const push = vi.fn();
const invalidateQueries = vi.fn();
let search = '';
let currentUser: Record<string, unknown> | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: push }),
  useSearchParams: () => new URLSearchParams(search),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries }),
}));

// useAuth con la misma logica que AuthContext para el modo guardado.
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => {
    const caps = deriveCapabilities(currentUser);
    return {
      user: currentUser,
      loading: false,
      ...caps,
      activeMode: resolveMode(caps, readStoredMode()),
      setActiveMode: writeStoredMode,
    };
  },
}));

vi.mock('@/components/profile/ProviderProfile', () => ({
  default: () => <div data-testid="provider-profile" />,
}));
vi.mock('@/components/profile/CustomerProfile', () => ({
  default: () => <div data-testid="customer-profile" />,
}));

import ProfilePage from '@/app/profile/page';

const base = { id_user: 1, name: 'Ana', lastname: 'Paz', email: 'a@a.com', date_create: '' };
const both = { ...base, customer: { id_customer: 1 }, provider: { id_provider: 2 } };
const onlyCustomer = { ...base, customer: { id_customer: 1 }, provider: null };
const none = { ...base, customer: null, provider: null };

beforeEach(() => {
  push.mockReset();
  invalidateQueries.mockReset();
  search = '';
  localStorage.clear();
});

describe('/profile', () => {
  it('AC-0002-14 con los dos perfiles muestra un selector con dos opciones', async () => {
    currentUser = both;
    render(<ProfilePage />);
    const group = await screen.findByRole('group', { name: /modo/i });
    expect(group.querySelectorAll('button')).toHaveLength(2);
  });

  it('AC-0002-14 ?mode=provider renderiza ProviderProfile', async () => {
    currentUser = both;
    search = 'mode=provider';
    render(<ProfilePage />);
    expect(await screen.findByTestId('provider-profile')).toBeInTheDocument();
    expect(screen.queryByTestId('customer-profile')).toBeNull();
  });

  it('AC-0002-14 ?mode=customer renderiza CustomerProfile', async () => {
    currentUser = both;
    search = 'mode=customer';
    render(<ProfilePage />);
    expect(await screen.findByTestId('customer-profile')).toBeInTheDocument();
    expect(screen.queryByTestId('provider-profile')).toBeNull();
  });

  it('AC-0002-14 sin ?mode ni guardado el default es customer', async () => {
    currentUser = both;
    render(<ProfilePage />);
    expect(await screen.findByTestId('customer-profile')).toBeInTheDocument();
  });

  it('AC-0002-15 con solo customer no hay selector y renderiza CustomerProfile aunque ?mode=provider', async () => {
    currentUser = onlyCustomer;
    search = 'mode=provider';
    render(<ProfilePage />);
    expect(await screen.findByTestId('customer-profile')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /modo/i })).toBeNull();
    expect(screen.queryByTestId('provider-profile')).toBeNull();
  });

  it('AC-0002-15 sin perfiles: sin selector, sin dashboard, mensaje de rol desconocido', async () => {
    currentUser = none;
    render(<ProfilePage />);
    expect(await screen.findByText(/rol desconocido/i)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /modo/i })).toBeNull();
    expect(screen.queryByTestId('customer-profile')).toBeNull();
    expect(screen.queryByTestId('provider-profile')).toBeNull();
  });

  it('AC-0002-16 elegir proveedor y volver a montar sin ?mode renderiza ProviderProfile', async () => {
    currentUser = both;
    const first = render(<ProfilePage />);
    fireEvent.click(await screen.findByRole('button', { name: /proveedor/i }));
    expect(readStoredMode()).toBe('provider');
    expect(push).toHaveBeenCalledWith('/profile?mode=provider', expect.anything());
    first.unmount();

    search = '';
    render(<ProfilePage />);
    expect(await screen.findByTestId('provider-profile')).toBeInTheDocument();
  });

  it('AC-0002-16 una URL con ?mode manda sobre el modo guardado', async () => {
    currentUser = both;
    writeStoredMode('provider');
    search = 'mode=customer';
    render(<ProfilePage />);
    expect(await screen.findByTestId('customer-profile')).toBeInTheDocument();
  });

  it('AC-0002-17 cambiar de modo invalida la cache exactamente una vez', async () => {
    currentUser = both;
    render(<ProfilePage />);
    fireEvent.click(await screen.findByRole('button', { name: /proveedor/i }));
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });

  it('AC-0002-17 elegir el modo que ya esta activo no invalida nada', async () => {
    currentUser = both;
    render(<ProfilePage />);
    fireEvent.click(await screen.findByRole('button', { name: /cliente/i }));
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it('AC-0002-16 si localStorage falla la pagina igual renderiza', async () => {
    currentUser = both;
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('cuota');
    };
    try {
      render(<ProfilePage />);
      fireEvent.click(await screen.findByRole('button', { name: /proveedor/i }));
      expect(invalidateQueries).toHaveBeenCalledTimes(1);
    } finally {
      Storage.prototype.setItem = orig;
    }
  });
});
