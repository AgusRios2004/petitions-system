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
        <div className="bg-amber-900/40 border-b border-amber-800/50 px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 backdrop-blur-sm sticky top-0 z-[60]">
          <div className="flex items-center gap-2 text-amber-200 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base">¡Tu perfil está incompleto!</span>
          </div>
          <Link
            href="/profile/complete"
            className="text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-4 rounded-full transition-colors shadow-sm"
          >
            Completar Ahora
          </Link>
        </div>
      )}
      {children}
    </>
  );
}
