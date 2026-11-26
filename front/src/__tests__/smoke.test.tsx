import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('runner del front (T-04)', () => {
  it('T-04 renderiza un componente en jsdom con jest-dom', () => {
    render(<p>hola</p>);
    expect(screen.getByText('hola')).toBeInTheDocument();
  });

  it('T-04 resuelve el alias @/', () => {
    expect(typeof cn).toBe('function');
  });
});
