import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { deriveCapabilities } from '@/lib/roles';

let currentUser: Record<string, unknown> | null = null;

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: currentUser, loading: false, ...deriveCapabilities(currentUser) }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';

const base = { id_user: 1, name: 'A', lastname: 'B', email: 'a@a.com', date_create: '' };

const warning = () => screen.queryByText(/perfil está incompleto/i);

describe('ProfileCompletionGuard (spec 0002 T8: capacidades, no role)', () => {
  it('T8 con perfil de cliente no avisa, aunque el objeto traiga role=provider', async () => {
    currentUser = { ...base, customer: { id_customer: 1 }, provider: null, role: 'provider' };
    render(<ProfileCompletionGuard><p>hijo</p></ProfileCompletionGuard>);
    expect(await screen.findByText('hijo')).toBeInTheDocument();
    expect(warning()).toBeNull();
  });

  it('T8 con los dos perfiles no avisa', async () => {
    currentUser = { ...base, customer: { id_customer: 1 }, provider: { id_provider: 2 } };
    render(<ProfileCompletionGuard><p>hijo</p></ProfileCompletionGuard>);
    expect(await screen.findByText('hijo')).toBeInTheDocument();
    expect(warning()).toBeNull();
  });

  it('T8 sin ningun perfil avisa que falta completar', async () => {
    currentUser = { ...base, customer: null, provider: null };
    render(<ProfileCompletionGuard><p>hijo</p></ProfileCompletionGuard>);
    expect(await screen.findByText(/perfil está incompleto/i)).toBeInTheDocument();
  });
});
