import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const push = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock('socket.io-client', () => ({ io: vi.fn() }));
vi.mock('@/service/socketService', () => ({ SOCKET_URL: 'http://test' }));
vi.mock('@/components/postulations/ProviderPostulations', () => ({ default: () => <div /> }));
vi.mock('@/components/petitions/ProviderOportunities', () => ({ default: () => <div /> }));
vi.mock('@/components/availability/ProviderAvailability', () => ({ default: () => <div /> }));
vi.mock('@/components/profile/provider/ProviderOffers', () => ({ default: () => <div /> }));
vi.mock('@/components/profile/provider/PublicProfileContent', () => ({ default: () => <div /> }));
vi.mock('@/components/profile/provider/ProfileSettings', () => ({ default: () => <div /> }));
vi.mock('@/components/profile/provider/ProviderDashboard', () => ({ default: () => <div /> }));

import ProviderProfile from '@/components/profile/ProviderProfile';

const user = {
  id_user: 1,
  name: 'A',
  lastname: 'B',
  email: 'a@a.com',
  date_create: '',
  customer: null,
  provider: { id_provider: 2 },
} as never;

beforeEach(() => {
  push.mockReset();
  search = '';
});

describe('ProviderProfile', () => {
  it('AC-0002-16 cambiar de pestana deja mode=provider en la URL', () => {
    search = 'mode=provider&tab=dashboard';
    render(<ProviderProfile user={user} />);
    fireEvent.click(screen.getByRole('button', { name: /postulaciones/i }));
    const url = new URL(push.mock.calls[0][0], 'http://x');
    expect(url.pathname).toBe('/profile');
    expect(url.searchParams.get('mode')).toBe('provider');
    expect(url.searchParams.get('tab')).toBe('postulaciones');
  });

  it('AC-0002-16 cambiar de pestana sin mode previo en la URL igual escribe mode=provider', () => {
    render(<ProviderProfile user={user} />);
    fireEvent.click(screen.getByRole('button', { name: /horarios/i }));
    const url = new URL(push.mock.calls[0][0], 'http://x');
    expect(url.searchParams.get('mode')).toBe('provider');
    expect(url.searchParams.get('tab')).toBe('disponibilidad');
  });
});
