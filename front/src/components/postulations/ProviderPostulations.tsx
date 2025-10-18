import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postulationService } from '@/service/postulationService';
import PostulationList from './PostulationList';

interface ProviderPostulationsProps {
  id_provider: number;
}

const ProviderPostulations: React.FC<ProviderPostulationsProps> = ({ id_provider }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['postulations', { id_provider }],
    queryFn: () => postulationService.getAllPostulations({ id_provider: id_provider }),
    select: (response) => response.data,
    enabled: !!id_provider,
  });

  if (isLoading) {
    return <p className="text-center text-gray-400">Cargando postulaciones...</p>;
  }

  if (isError) {
    return <p className="text-center text-red-500">Error al cargar las postulaciones: {error.message}</p>;
  }

  return <PostulationList postulations={data || []} role="provider" />;
};

export default ProviderPostulations;