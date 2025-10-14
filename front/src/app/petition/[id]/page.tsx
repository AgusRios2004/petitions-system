
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPetitionById } from '@/service/petitionService';
import PetitionDetail from '@/components/petitions/PetitionDetail';

const PetitionDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const petitionId = parseInt(id, 10); // Convert id to number

  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey: ['petition', petitionId],
    queryFn: () => getPetitionById(petitionId),
    enabled: !!petitionId, // Solo ejecuta la consulta si el id existe y es un número válido
  });

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (isError) {
    return <div>Error al cargar la petición.</div>;
  }

  // Extraer la petición real del campo 'data' de la respuesta de la API
  const petition = apiResponse?.data;

  if (!petition) {
    return <div>Petición no encontrada.</div>;
  }

  return <PetitionDetail petition={petition} />;};

export default PetitionDetailPage;
