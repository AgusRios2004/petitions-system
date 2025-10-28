'use client';

import React from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { availabilityService } from '@/service/availabilityService';

const ProviderAvailability = () => {

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ['availabilities'],
    queryFn: availabilityService.getAllAvailabilities,
  })
  
  if (isLoading) {
    return <span>Cargando...</span>;
  }
  
  if (isError) {
    return <span>Error: {(error as Error).message}</span>;
  }

  console.log('Availabilities:', data?.data);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestionar Disponibilidad</h2>
      <p>Aquí podrás gestionar tus horarios de disponibilidad.</p>
    </div>
  );
};

export default ProviderAvailability;