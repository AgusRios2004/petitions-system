import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- mocks ---
let currentUser: Record<string, unknown> | null = null;
const getProviderHistory = vi.fn();
const getPostulationsByProvider = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '7' }),
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: currentUser, loading: false }) }));
vi.mock('@/service/postulationService', () => ({
  postulationService: {
    getProviderHistory: (...a: unknown[]) => getProviderHistory(...a),
    getPostulationsByProvider: (...a: unknown[]) => getPostulationsByProvider(...a),
  },
}));

import ProviderPostulationsPage from '@/app/provider/[id]/postulations/page';

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ProviderPostulationsPage />
    </QueryClientProvider>,
  );

const base = { id_user: 1, name: 'Ana', lastname: 'Paz', email: 'a@a.com', date_create: '' };

describe('/provider/[id]/postulations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProviderHistory.mockResolvedValue([
      {
        id_postulation: 1, state: 'Aceptado', date: '2026-11-20T12:00:00.000Z',
        petition: { id_petition: 3, description: 'Arreglar una canilla' },
      },
    ]);
    getPostulationsByProvider.mockResolvedValue([]);
  });

  it('AC-0004-07: quien no es el dueño usa getProviderHistory(id) y ve descripción, estado y fecha, sin Propuesta ni Costo', async () => {
    currentUser = { ...base, provider: { id_provider: 99 } };
    const { container } = renderPage();
    expect(await screen.findByText(/Arreglar una canilla/)).toBeTruthy();
    expect(getProviderHistory).toHaveBeenCalledWith('7');
    expect(getPostulationsByProvider).not.toHaveBeenCalled();
    expect(screen.getByText(/Aceptado/)).toBeTruthy();
    expect(screen.getByText(/2026/)).toBeTruthy();
    expect(container.textContent).not.toMatch(/Propuesta/);
    expect(container.textContent).not.toMatch(/Costo/);
  });

  it('AC-0004-07 (borde): un historial vacío muestra "No se encontraron postulaciones"', async () => {
    currentUser = { ...base, customer: { id_customer: 1 } };
    getProviderHistory.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/No se encontraron postulaciones/)).toBeTruthy();
  });

  it('AC-0004-08: para el dueño el filtro ofrece Pendiente, Aceptado, Rechazado y Finalizado con los valores 1, 2, 3 y 6', async () => {
    currentUser = { ...base, provider: { id_provider: 7 } };
    renderPage();
    const select = (await screen.findByRole('combobox')) as HTMLSelectElement;
    const options = Array.from(select.options).filter((o) => o.value !== '');
    expect(options.map((o) => [o.textContent, o.value])).toEqual([
      ['Pendiente', '1'], ['Aceptado', '2'], ['Rechazado', '3'], ['Finalizado', '6'],
    ]);
    await waitFor(() => expect(getProviderHistory).not.toHaveBeenCalled());
  });
});
