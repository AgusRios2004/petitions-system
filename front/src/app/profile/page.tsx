'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Mode, resolveMode } from '@/lib/roles';

import { UserProfile } from '@/types/common'; // Importamos UserProfile desde common.ts

import ProviderProfile from '@/components/profile/ProviderProfile';
import CustomerProfile from '@/components/profile/CustomerProfile';
import ProfileModeSwitch from '@/components/profile/ProfileModeSwitch';

// --- COMPONENTE PRINCIPAL DE LA PÁGINA DE PERFIL ---
function ProfileContent() {
  const { user, loading, isCustomer, isProvider, activeMode, setActiveMode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, isClient]);

  if (!isClient || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-950">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 font-medium animate-pulse">Cargando tu perfil...</p>
      </div>
    );
  }

  if (!user) return null;

  // El modo sale de ?mode=, si no del ultimo elegido, si no del default del usuario.
  // Un modo sin perfil se ignora (spec 0002, casos de borde).
  const mode = resolveMode({ isCustomer, isProvider }, searchParams.get('mode'), activeMode);

  const handleModeChange = (next: Mode) => {
    if (next === mode) return;
    setActiveMode(next);
    queryClient.invalidateQueries();
    router.push(`/profile?mode=${next}`, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Bienvenido {user.name} {user.lastname}
          </h1>
        </header>

        {isCustomer && isProvider && mode && (
          <div className="mb-6">
            <ProfileModeSwitch mode={mode} onChange={handleModeChange} />
          </div>
        )}

        {mode === 'provider' && <ProviderProfile user={user as UserProfile} />}
        {mode === 'customer' && <CustomerProfile user={user as UserProfile} />}
        {mode === null && (
          <p className="text-center text-gray-400 mt-10">
            Rol desconocido o sin asignar.
          </p>
        )}
      </div>
    </main>
  );
}

// useSearchParams exige un limite de Suspense para que `next build` pueda prerenderizar.
export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
