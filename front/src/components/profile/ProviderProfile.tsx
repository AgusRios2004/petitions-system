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

import ProviderDashboard from './provider/ProviderDashboard';

// --- COMPONENTE DE PERFIL DE PROVEEDOR ---
const ProviderProfile = ({ user }: { user: UserProfile }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const handleTabClick = (tabId: string) => {
    router.push(`/profile?tab=${tabId}`, { scroll: false });
  };

  const activeTab = initialTab;

  const tabs = [
    { id: 'dashboard', label: 'Resumen' },
    { id: 'perfil-publico', label: 'Mi Perfil' },
    { id: 'oportunidades', label: 'Buscar Trabajos' },
    { id: 'ofertas', label: 'Ofertas' },
    { id: 'postulaciones', label: 'Postulaciones' },
    { id: 'disponibilidad', label: 'Horarios' },
  ];

  const renderContent = () => {
    if (!user.provider) return <p className="text-white p-10 text-center">No se encontró información de proveedor.</p>;

    switch (activeTab) {
      case 'dashboard':
        return <ProviderDashboard providerId={user.provider.id_provider} />;
      case 'postulaciones':
        return <ProviderPostulations id_provider={user.provider.id_provider} />;
      case 'oportunidades':
        return <ProviderOportunities />;
      case 'ofertas':
        return <ProviderOffers providerId={user.provider.id_provider} />;
      case 'disponibilidad':
        return <ProviderAvailability />;
      case 'perfil-publico':
        return <PublicProfileContent providerId={user.provider.id_provider} />;
      case 'configuracion':
        return user.id_user ? <ProfileSettings userId={user.id_user} /> : null;
      default:
        return <ProviderDashboard providerId={user.provider.id_provider} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="w-full overflow-x-auto scrollbar-hide py-1">
        <nav className="flex items-center gap-1.5 p-1.5 bg-gray-950/40 backdrop-blur-md rounded-2xl border border-white/5 w-fit min-w-max mx-auto sm:mx-0" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`whitespace-nowrap py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 ring-2 ring-blue-500/20'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-0 sm:p-2 bg-transparent min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProviderProfile;
