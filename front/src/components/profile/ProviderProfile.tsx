'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserProfile } from '@/types/common'; // Asumiendo que UserProfile está en common.ts

// Importaciones de componentes existentes
import ProviderPostulations from '@/components/postulations/ProviderPostulations';
import ProviderOportunities from '@/components/petitions/ProviderOportunities';
import ProviderAvailability from '@/components/availability/ProviderAvailability';

// Importaciones de los nuevos componentes que hemos creado
import PublicProfileContent from './provider/PublicProfileContent';
import ProfileSettings from './provider/ProfileSettings';

// --- COMPONENTE DE PERFIL DE PROVEEDOR ---
const ProviderProfile = ({ user }: { user: UserProfile }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'perfil-publico';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    // --- LÓGICA DE CONEXIÓN DE SOCKET ---
    const token = localStorage.getItem('accessToken');
    console.log('Intentando conectar socket. Token encontrado:', !!token); // <-- Añadido para depurar
    if (!token) return; // No intentar conectar si no hay token

    // Conecta al backend, enviando el token para la autenticación
    const socket: Socket = io('http://localhost:3000', {
      auth: {
        token: token,
      },
    });

    socket.on('connect', () => {
      console.log('✅ Conectado al servidor de sockets con ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor de sockets.');
    });

    // Limpieza: desconectar el socket cuando el componente se desmonte
    return () => {
      socket.disconnect();
    };
  }, []);

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
        ) : activeTab == "perfil-publico" && user.provider ? (
          <PublicProfileContent providerId={user.provider.id_provider} /> // Usamos el nuevo componente
        ) : activeTab == "configuracion" && user.id_user ? (
          <ProfileSettings userId={user.id_user} /> // Usamos el nuevo componente
        ) : (
          <p>Contenido de la pestaña: {activeTab}</p>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;
