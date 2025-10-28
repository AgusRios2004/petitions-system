import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postulationService } from '@/service/postulationService';
import PostulationList from './PostulationList';

interface PetitionPostulationsProps {
  petitionId: number;
}

const PetitionPostulations: React.FC<PetitionPostulationsProps> = ({ petitionId }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['postulations', { petitionId }],
    queryFn: () => postulationService.getAllPostulations({ id_petition: petitionId }),
    select: (response) => response.data,
    enabled: !!petitionId,
  });

  if (isLoading) {
    return <p className="text-center text-gray-400">Cargando postulaciones...</p>;
  }

  if (isError) {
    return <p className="text-center text-red-500">Error al cargar las postulaciones: {error.message}</p>;
  }

  return <PostulationList postulations={data || []} role="customer" />;
};

export default PetitionPostulations;