import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { getPetitions } from '@/service/petitionService';
import { stateService } from '@/service/stateService';

import PetitionCard from './PetitionCard';
import Tabs from '@/components/ui/Tabs';
import Pagination from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';

import { IState, IPetitionCardData } from '@/types/common';

interface CustomerPetitionsProps {
  customerId: number;
}

const CustomerPetitions: React.FC<CustomerPetitionsProps> = ({ customerId }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 6,
    id_state: undefined as number | undefined,
  });

  // 1. Obtener los estados posibles de las peticiones
  const { data: petitionStatusTabs, isLoading: isLoadingStates } = useQuery({
    queryKey: ['petitionStates'],
    queryFn: () => stateService.getAllStates(),
    select: (response) =>
      response.data?.map((state: IState) => ({
        label: state.state,
        value: state.id_state,
      })) || [],
  });

  // 2. Efecto para inicializar el estado seleccionado (por defecto 'Pendiente' o el primero)
  useEffect(() => {
    if (petitionStatusTabs && filters.id_state === undefined) {
      // Intentamos buscar 'Pendiente' (ID=1 usualmente)
      const pending = petitionStatusTabs.find(
        (s: { label: string; value: number }) =>
          s.label.toLowerCase().includes('pendiente') || s.value === 1
      );

      setFilters((prev) => ({
        ...prev,
        id_state: pending ? pending.value : petitionStatusTabs[0]?.value,
      }));
    }
  }, [petitionStatusTabs, filters.id_state]);

  // 3. Obtener las peticiones filtradas
  const { data, isLoading: isLoadingPetitions, isError, error } = useQuery({
    queryKey: ['petitions', customerId, filters],
    queryFn: () => {
      if (!customerId || filters.id_state === undefined) return Promise.resolve(null);
      return getPetitions({
        id_customer: customerId,
        ...filters,
      });
    },
    select: (response) => response?.data,
    enabled: !!customerId && filters.id_state !== undefined,
  });

  const handleStatusTabChange = (newStatus: number) => {
    setFilters((prev) => ({
      ...prev,
      id_state: newStatus,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // --- LÓGICA DE CARGA UNIFICADA ---
  // Consideramos que está cargando si estamos obteniendo estados, 
  // o si ya tenemos estados pero aún no hemos cargado las peticiones iniciales.
  const isInitialLoading = isLoadingStates || (filters.id_state !== undefined && isLoadingPetitions && !data);

  if (isError)
    return (
      <div className="p-8 bg-red-900/10 border border-red-900/20 rounded-2xl text-center">
        <p className="text-red-500 font-bold mb-2">Error al cargar peticiones</p>
        <p className="text-xs text-red-700">{error?.message}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Renderizamos las pestañas si ya las tenemos, incluso si las peticiones cargan después */}
        {petitionStatusTabs ? (
          <div className="w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <Tabs
              tabs={petitionStatusTabs}
              activeTab={filters.id_state || 0}
              onTabClick={handleStatusTabChange}
              className="!mx-0"
            />
          </div>
        ) : (
          <div className="h-10 w-64 bg-gray-800 animate-pulse rounded-xl" />
        )}

        <Link href="/petition/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-900/40 border-none px-8">
            Crear Petición
          </Button>
        </Link>
      </div>

      {isInitialLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-[280px] w-full bg-gray-800/50 animate-pulse rounded-2xl border border-white/5" />
          ))}
        </div>
      ) : data && data.petitions && data.petitions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.petitions.map((petition: IPetitionCardData) => (
              <PetitionCard key={petition.id_petition} petition={petition} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="pt-8 flex justify-center">
              <Pagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-dashed border-white/5">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-600">📭</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No hay peticiones
          </h3>
          <p className="text-gray-400 max-w-xs mx-auto text-sm italic">
            No encontramos peticiones para este estado. Puedes cambiar de categoría o crear una nueva.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerPetitions;
