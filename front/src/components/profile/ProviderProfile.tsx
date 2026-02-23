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

    // --- CENTRO DE NOTIFICACIONES EN TIEMPO REAL ---

    // Evento para: Clientes
    socket.on('new_postulation', (postulation: IPostulation) => {
      console.log('EVENTO RECIBIDO: new_postulation', postulation);
      toast.success(
        `¡Nueva postulación! Un proveedor ha ofertado $${postulation.cost} para tu petición.`
      );
    });

    socket.on('postulation_withdrawn', (data: { message: string, petition_id: number }) => {
      console.log('EVENTO RECIBIDO: postulation_withdrawn', data);
      toast.success(data.message || 'Un proveedor ha retirado su postulación.');
    });

    // Eventos para: Proveedores
    socket.on('postulation_accepted', (postulation: IPostulation) => {
      console.log('EVENTO RECIBIDO: postulation_accepted', postulation);
      toast.success(
        `¡Felicidades! Tu postulación para "${postulation.petition.description.substring(0, 20)}..." ha sido aceptada.`,
        { icon: '🎉' }
      );
      // Opcional: Aquí podrías invalidar queries de React-Query para refrescar la lista de postulaciones
    });

    socket.on('postulation_rejected', (data: { message: string, petition_id: number }) => {
      console.log('EVENTO RECIBIDO: postulation_rejected', data);
      toast.error(
        `Tu postulación no fue seleccionada esta vez. ¡Sigue intentando!`,
        { icon: '😕' }
      );
      // Opcional: Aquí también podrías invalidar la query de postulaciones
    });

    socket.on('petition_cancelled', (data: { message: string, petition_id: number }) => {
      console.log('EVENTO RECIBIDO: petition_cancelled', data);
      toast.error(data.message || 'Una petición a la que te postulaste fue cancelada.');
    });

    socket.on('new_opportunity', (data: { message: string, petition_id: number }) => {
      console.log('EVENTO RECIBIDO: new_opportunity', data);
      toast.success(data.message || '¡Nueva oportunidad de trabajo disponible!', { icon: '✨' });
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
    { id: 'ofertas', label: 'Mis Ofertas' },
    { id: 'postulaciones', label: 'Mis Postulaciones' },
    { id: 'disponibilidad', label: 'Disponibilidad' },
  ];

  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{ className: 'bg-gray-700 text-white' }}
      />
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
        ) : activeTab === 'ofertas' && user.provider ? (
          <ProviderOffers providerId={user.provider.id_provider} />
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
