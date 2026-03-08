'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast'; // Ya lo tienes, perfecto
import { useRouter, useSearchParams } from 'next/navigation';
import { UserProfile, IPostulation } from '@/types/common'; // 1. Importamos IPostulation

// Importaciones de componentes existentes
import ProviderPostulations from '@/components/postulations/ProviderPostulations';
import ProviderOportunities from '@/components/petitions/ProviderOportunities';
import ProviderAvailability from '@/components/availability/ProviderAvailability';
import ProviderOffers from '@/components/profile/provider/ProviderOffers';

// Importaciones de los nuevos componentes que hemos creado
import PublicProfileContent from './provider/PublicProfileContent';
import ProfileSettings from './provider/ProfileSettings';
import { SOCKET_URL } from '@/service/socketService';

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
    { id: 'ofertas', label: 'Mis Ofertas' },
    { id: 'postulaciones', label: 'Mis Postulaciones' },
    { id: 'disponibilidad', label: 'Disponibilidad' },
  ];

  return (
    <div>
      <div className="border-b border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max px-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-lg transition-all duration-200 ${activeTab === tab.id
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 sm:p-6 bg-gray-800 rounded-lg min-h-[400px] shadow-xl border border-gray-700/50">
        {activeTab === 'postulaciones' && user.provider ? (
          <ProviderPostulations id_provider={user.provider.id_provider} />
        ) : activeTab === 'oportunidades' ? (
          <ProviderOportunities />
        ) : activeTab === 'ofertas' && user.provider ? (
          <ProviderOffers providerId={user.provider.id_provider} />
        ) : activeTab === 'disponibilidad' ? (
          <ProviderAvailability />
        ) : activeTab == "perfil-publico" && user.provider ? (
          <PublicProfileContent providerId={user.provider.id_provider} />
        ) : activeTab == "configuracion" && user.id_user ? (
          <ProfileSettings userId={user.id_user} />
        ) : (
          <p>Contenido de la pestaña: {activeTab}</p>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;
