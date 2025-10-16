'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

// Componentes de UI y Servicios
import { getPetitions, updatePetitionState } from '@/service/petitionService';
import { Button } from '@/components/ui/Button';
import PetitionCard from '@/components/petitions/PetitionCard';
import Tabs from '@/components/ui/Tabs';
import Pagination from '@/components/ui/Pagination';

// --- TIPOS ---
interface UserProfile {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  customer: { id_customer: number; } | null;
  provider: object | null;
  profile_picture_url?: string | null;
  role: 'customer' | 'provider' | 'admin' | 'unknown';
  is_staff?: boolean | number;
}

import { STATUS_TABS as petitionStatusTabs } from '@/helpers/statusHelper';

// --- COMPONENTE DE PERFIL DE PROVEEDOR ---
const ProviderProfile = ({ user }: { user: UserProfile }) => {
  // ... (sin cambios)
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

// --- COMPONENTE DE PERFIL DE CLIENTE (CON LÓGICA DE PETICIONES INTEGRADA) ---
const CustomerProfile = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState('peticiones');
  const router = useRouter();
  const queryClient = useQueryClient();

  const customerTabs = [
    { id: 'peticiones', label: 'Mis Peticiones' },
    { id: 'informacion', label: 'Información Personal' },
    { id: 'historial', label: 'Historial y Calificaciones' },
  ];

  const [filters, setFilters] = useState({
    page: 1,
    limit: 6,
    id_state: 3,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['petitions', user?.customer?.id_customer, filters],
    queryFn: () => {
      if (!user?.customer?.id_customer) return null;
      const params = { id_customer: user.customer.id_customer, ...filters };
      return getPetitions(params);
    },
    select: (response) => response?.data,
    enabled: !!user?.customer?.id_customer,
  });

  const handleStatusTabChange = (newStatus: number) => {
    setFilters(prev => ({ ...prev, id_state: newStatus, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const renderPetitionsContent = () => {
    if (isLoading) return <p className="text-center text-gray-400">Cargando peticiones...</p>;
    if (isError) return <p className="text-center text-red-500">Error al cargar peticiones: {error?.message}</p>;

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <Tabs 
            tabs={petitionStatusTabs}
            activeTab={filters.id_state}
            onTabClick={handleStatusTabChange}
          />
          <Link href="/petition/create">
            <Button fullWidth={false}>+ Crear Petición</Button>
          </Link>
        </div>

        {data && data.petitions && data.petitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.petitions.map((petition: any) => (
              <PetitionCard 
                key={petition.id_petition} 
                petition={petition} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-white">No tienes peticiones en este estado</h3>
            <p className="text-gray-400 mt-2">¡Prueba a cambiar de pestaña o crea una nueva petición!</p>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <Pagination 
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </>
    );
  };

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
        {activeTab === 'peticiones' && renderPetitionsContent()}
        {activeTab === 'informacion' && <p>Contenido de Información Personal...</p>}
        {activeTab === 'historial' && <p>Contenido de Historial y Calificaciones...</p>}
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