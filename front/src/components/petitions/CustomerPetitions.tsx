import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { getPetitions } from '@/service/petitionService';
import { stateService } from '@/service/stateService';

import PetitionCard from './PetitionCard';
import Tabs from '@/components/ui/Tabs';
import Pagination from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';

import { IState } from '@/types/common';

interface CustomerPetitionsProps {
  customerId: number;
}

const CustomerPetitions: React.FC<CustomerPetitionsProps> = ({ customerId }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 6,
    id_state: undefined as number | undefined,
  });

  const { data: petitionStatusTabs, isLoading: isLoadingStates } = useQuery({
    queryKey: ['petitionStates'],
    queryFn: () => stateService.getAllStates(),
    select: (response) =>
      response.data?.map((state: IState) => ({
        label: state.state,
        value: state.id_state,
      })) || [],
  });

  useEffect(() => {
    if (petitionStatusTabs && filters.id_state === undefined) {
      const pending = petitionStatusTabs.find((s: { value: number }) => s.value === 3);

      setFilters((prev) => ({
        ...prev,
        id_state: pending ? pending.value : petitionStatusTabs[0].value,
      }));
    }
  }, [petitionStatusTabs, filters.id_state]);

  const { data, isLoading, isError, error } = useQuery({
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

  if (isLoadingStates)
    return <p className="text-center text-gray-400">Cargando estados...</p>;
  if (isLoading) return <p className="text-center text-gray-400">Cargando peticiones...</p>;
  if (isError)
    return (
      <p className="text-center text-red-500">
        Error al cargar peticiones: {error?.message}
      </p>
    );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        {petitionStatusTabs && filters.id_state !== undefined && (
          <Tabs
            tabs={petitionStatusTabs}
            activeTab={filters.id_state}
            onTabClick={handleStatusTabChange}
          />
        )}

        <Link href="/petition/create">
          <Button fullWidth={false}>Crear Petición</Button>
        </Link>
      </div>

      {data && data.petitions && data.petitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {data.petitions.map((petition: any) => (
            <PetitionCard key={petition.id_petition} petition={petition} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-white">
            No tienes peticiones en este estado
          </h3>
          <p className="text-gray-400 mt-2">
            ¡Prueba a cambiar de pestaña o crea una nueva petición!
          </p>
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

export default CustomerPetitions;
