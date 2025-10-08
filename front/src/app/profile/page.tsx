'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  customer: object | null;
  provider: object | null;
  profile_picture_url?: string | null;
  role?: 'customer' | 'provider';
  profileStatus?: {
    isCustomerComplete: boolean;
    isProviderComplete: boolean;
    hasCompletedProfile: boolean;
  };
}

// --- SUBCOMPONENTES ---
const ProviderProfile = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState('perfil-publico');
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
      <div className="p-6 bg-gray-800 rounded-lg min-h-[300px]">
        <p>Contenido de la pestaña: {activeTab}</p>
      </div>
    </div>
  );
};

const CustomerProfile = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState('peticiones');
  const tabs = [
    { id: 'peticiones', label: 'Mis Peticiones' },
    { id: 'informacion', label: 'Información Personal' },
    { id: 'historial', label: 'Historial y Calificaciones' },
  ];

  return (
    <div>
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
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
      <div className="p-6 bg-gray-800 rounded-lg min-h-[300px]">
        <p>Contenido de la pestaña: {activeTab}</p>
      </div>
    </div>
  );
};

// --- PRINCIPAL ---
export default function ProfilePage() {
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
        <p className="text-xl">Cargando perfil...</p>
      </div>
    );
  }

  const profileUser = {
    ...(user as any),
    role: (user as any)?.provider ? 'provider' : 'customer',
    profileStatus: (user as any)?.profileStatus || { hasCompletedProfile: true },
  } as UserProfile;

  // Si no completó el perfil
  if (!profileUser.profileStatus?.hasCompletedProfile) {
    return (
      <div className="container mx-auto mt-10 text-center">
        <h1 className="text-3xl font-bold">Completa tu perfil</h1>
        <p className="mt-4">
          Hola {profileUser.name}, por favor completa tu perfil para continuar.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <button 
            onClick={() => router.push('/profile/complete')} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
            Completar Perfil
          </button>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Bienvenido, {profileUser.name}
          </h1>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {profileUser.profile_picture_url ? (
              <img src={profileUser.profile_picture_url} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">Foto</span>
            )}
          </div>
        </header>
        {profileUser.role === 'provider' 
          ? <ProviderProfile user={profileUser} /> 
          : <CustomerProfile user={profileUser} />}
      </div>
    </main>
  );
}
