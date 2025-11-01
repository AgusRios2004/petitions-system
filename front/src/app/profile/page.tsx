'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  customer: { id_customer: number; } | null;
  provider: { id_provider: number; } | null;
  profile_picture_url?: string | null;
  role: 'customer' | 'provider' | 'admin' | 'unknown';
  is_staff?: boolean | number;
}

import ProviderPostulations from '@/components/postulations/ProviderPostulations';
import ProviderOportunities from '@/components/petitions/ProviderOportunities';
import ProviderAvailability from '@/components/availability/ProviderAvailability';
import ProviderPublicProfilePage from '../provider/[id]/page';

import { useSearchParams } from 'next/navigation';

// --- COMPONENTE DE PERFIL DE PROVEEDOR ---
const ProviderProfile = ({ user }: { user: UserProfile }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'perfil-publico';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/profile?tab=${tabId}`, { scroll: false });
  };

  const tabs = [
    { id: 'perfil-publico', label: 'Mi Perfil Público' },
    { id: 'oportunidades', label: 'Buscar Oportunidades' },
    { id: 'postulaciones', label: 'Mis Postulaciones' },
    { id: 'disponibilidad', label: 'Disponibilidad' },
    { id: 'configuracion', label: 'Configuración' },
  ];

  return (
    <div>
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
                activeTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6 bg-gray-800 rounded-lg min-h-[300px]">
        {activeTab === 'postulaciones' && user.provider ? (
          <ProviderPostulations id_provider={user.provider.id_provider} />
        ) : activeTab === 'oportunidades' ? (
          <ProviderOportunities />
        ) : activeTab === 'disponibilidad' ? (
          <ProviderAvailability />
        ) : activeTab == "perfil-publico" ? (
          <ProviderPublicProfilePage params={user.provider?.id_provider} />
        ) : (
          <p>Contenido de la pestaña: {activeTab}</p>
        )}
      </div>
    </div>
  );
};

import CustomerPetitions from '@/components/petitions/CustomerPetitions';

// --- COMPONENTE DE PERFIL DE CLIENTE (CON LÓGICA DE PETICIONES INTEGRADA) ---
const CustomerProfile = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState('peticiones');

  const customerTabs = [
    { id: 'peticiones', label: 'Mis Peticiones' },
    { id: 'informacion', label: 'Información Personal' },
    { id: 'historial', label: 'Historial y Calificaciones' },
  ];

  return (
    <div>
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {customerTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
                activeTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6 bg-gray-800 rounded-lg min-h-[400px]">
        {activeTab === 'peticiones' && user.customer ? (
          <CustomerPetitions customerId={user.customer.id_customer} />
        ) : activeTab === 'informacion' ? (
          <p>Contenido de Información Personal...</p>
        ) : activeTab === 'historial' ? (
          <p>Contenido de Historial y Calificaciones...</p>
        ) : null}
      </div>
    </div>
  );
};


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
            Bienvenido, {user.name}
          </h1>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {user.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">Foto</span>
            )}
          </div>
        </header>

        {user.role === 'provider' ? (
          <ProviderProfile user={user as UserProfile} />
        ) : user.role === 'customer' ? (
          <CustomerProfile user={user as UserProfile} />
        ) : (
          <p className="text-center text-gray-400 mt-10">
            Rol desconocido o sin asignar.
          </p>
        )}
      </div>
    </main>
  );
}