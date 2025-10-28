import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { getPetitions } from '@/service/petitionService';
import { Button } from '@/components/ui/Button';
import PetitionCard from './PetitionCard';
import Tabs from '@/components/ui/Tabs';
import Pagination from '@/components/ui/Pagination';
import { STATUS_TABS as petitionStatusTabs } from '@/helpers/statusHelper';

interface CustomerPetitionsProps {
  customerId: number;
}

const CustomerPetitions: React.FC<CustomerPetitionsProps> = ({ customerId }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 6,
    id_state: 3,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['petitions', customerId, filters],
    queryFn: () => {
      if (!customerId) return null;
      const params = { id_customer: customerId, ...filters };
      return getPetitions(params);
    },
    select: (response) => response?.data,
    enabled: !!customerId,
  });

  const handleStatusTabChange = (newStatus: number) => {
    setFilters(prev => ({ ...prev, id_state: newStatus, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

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
          <Button fullWidth={false}>Crear Petición</Button>
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

export default CustomerPetitions;