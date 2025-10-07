'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CustomerCompletionForm } from '@/components/profile/CustomerCompletionForm';
import { ProviderCompletionForm } from '@/components/profile/ProviderCompletionForm';

// Tipo para el objeto `user` que viene del AuthContext
interface AuthUser {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  customer: object | null;
  provider: object | null;
  profileStatus: {
    isCustomerComplete: boolean;
    isProviderComplete: boolean;
    hasCompletedProfile: boolean;
  };
}

// --- COMPONENTE PARA EL FORMULARIO DE COMPLETAR PERFIL ---
const ProfileCompletionFlow = ({ user }: { user: AuthUser }) => {
  const { isCustomerComplete, isProviderComplete, hasCompletedProfile } = user.profileStatus;
  const router = useRouter();

  // Si por alguna razón el perfil ya está completo, redirigir al perfil principal
  useEffect(() => {
    if (hasCompletedProfile) {
      router.push('/profile');
    }
  }, [hasCompletedProfile, router]);

  const needsCustomer = user.customer && !isCustomerComplete;
  const needsProvider = user.provider && !isProviderComplete;

  const initialTab = needsCustomer ? 'customer' : 'provider';
  const [activeTab, setActiveTab] = useState(initialTab);

  if (needsCustomer && needsProvider) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Completa tu Perfil</h1>
        <p className="text-gray-400 mb-6">Para continuar, necesitas completar la información de tu perfil de cliente y de proveedor.</p>
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('customer')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${
                activeTab === 'customer'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}>
              Completar Perfil Cliente
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${
                activeTab === 'provider'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}>
              Completar Perfil Proveedor
            </button>
          </nav>
        </div>
        {activeTab === 'customer' && <CustomerCompletionForm />}
        {activeTab === 'provider' && <ProviderCompletionForm />}
      </div>
    );
  } else if (needsCustomer) {
    return <CustomerCompletionForm />;
  } else if (needsProvider) {
    return <ProviderCompletionForm />;
  } else {
    // Esto se muestra mientras se redirige si el perfil ya está completo
    return <p className="text-xl text-white">Verificando estado del perfil...</p>;
  }
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function CompleteProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, isClient]);

  if (!isClient || loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <ProfileCompletionFlow user={user as AuthUser} />
    </main>
  );
}
