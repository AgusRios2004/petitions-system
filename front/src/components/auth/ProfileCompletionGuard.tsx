"use client";
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ProfileCompletionGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This runs only on the client, after initial render
    setIsClient(true);
  }, []);

  const needsProfileCompletion = user && (
    (user.role === 'customer' && !user.customer) ||
    (user.role === 'provider' && !user.provider)
  );

  // We only render the warning on the client side to avoid hydration mismatch
  const shouldShowWarning = isClient && !loading && needsProfileCompletion;

  const isAuthRoute = typeof window !== 'undefined' && (window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register'));

  return (
    <>
      {shouldShowWarning && !isAuthRoute && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fff3e0', // Light Orange
          color: '#e65100', // Dark Orange text
          textAlign: 'center',
          borderBottom: '1px solid #ffcc80', // Orange border
        }}>
          <strong>Advertencia:</strong> Tu perfil está incompleto. Por favor,
          <Link href="/profile/complete" style={{ textDecoration: 'underline', marginLeft: '0.5rem', color: '#e65100' }}>
            completa tu información aquí
          </Link>
          .
        </div>
      )}
      {children}
    </>
  );
}
