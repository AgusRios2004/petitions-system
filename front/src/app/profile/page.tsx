'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { UserProfile } from '@/types/common'; // Importamos UserProfile desde common.ts

import ProviderPostulations from '@/components/postulations/ProviderPostulations';
import ProviderOportunities from '@/components/petitions/ProviderOportunities';
import ProviderAvailability from '@/components/availability/ProviderAvailability';

import { useSearchParams } from 'next/navigation';

import ProviderProfile from '@/components/profile/ProviderProfile';

import CustomerPetitions from '@/components/petitions/CustomerPetitions';

import IncompleteProfile from '@/components/profile/IncompleteProfile';

import CustomerProfile from '@/components/profile/CustomerProfile';


// --- COMPONENTE PRINCIPAL DE LA PÁGINA DE PERFIL ---
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, isClient]);

  if (!isClient || loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Bienvenido {user.name} {user.lastname}
          </h1>
        </header>

        {(() => {
          if (user.role === 'provider') {
            // Si el rol es 'provider', nos aseguramos de que user.provider exista.
            return user.provider 
              ? <ProviderProfile user={user as UserProfile} /> 
              : <IncompleteProfile role="provider" />;
          }
          if (user.role === 'customer') {
            // Si el rol es 'customer', nos aseguramos de que user.customer exista.
            return user.customer 
              ? <CustomerProfile user={user as UserProfile} /> 
              : <IncompleteProfile role="customer" />;
          }
          // Si el rol no es ninguno de los dos, mostramos el mensaje por defecto.
          return (
            <p className="text-center text-gray-400 mt-10">
              Rol desconocido o sin asignar.
            </p>
          );
        })()}
      </div>
    </main>
  );
}