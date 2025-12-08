
'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPetitionById, updatePetition } from '@/service/petitionService';
import { postulationService } from '@/service/postulationService';
import { useAuth } from '@/context/AuthContext';
import PetitionDetail from '@/components/petitions/PetitionDetail';
import toast from 'react-hot-toast';
// Placeholder for the form component we will create
import PetitionEditForm from '@/components/petitions/PetitionEditForm'; 

const PetitionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const petitionId = parseInt(id, 10);

  const [isEditing, setIsEditing] = useState(false);

  const { data: apiResponse, isLoading: isLoadingPetition, isError } = useQuery({
    queryKey: ['petition', petitionId],
    queryFn: () => getPetitionById(petitionId),
    enabled: !!petitionId,
  });

  const { data: postulationsData, isLoading: isLoadingPostulations } = useQuery({
    queryKey: ['providerPostulations', user?.provider?.id_provider],
    queryFn: () => postulationService.getAllPostulations({ id_provider: user!.provider!.id_provider }),
    enabled: !!user?.provider,
  });

  const petition = apiResponse?.data;

  const hasAlreadyPostulated = useMemo(() => {
    if (!postulationsData?.data) return false;
    return postulationsData.data.some((p: any) => p.id_petition === petitionId);
  }, [postulationsData, petitionId]);

  const canPostulate = useMemo(() => {
    if (!user?.provider || !petition || hasAlreadyPostulated) return false;
    // Usamos el nombre del estado para no hardcodear el ID.
    return petition.states.state.toLowerCase() === 'abierta';
  }, [user, petition, hasAlreadyPostulated]);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => updatePetition(id, payload),
    onSuccess: () => {
      toast.success('Petición actualizada con éxito');
      queryClient.invalidateQueries({ queryKey: ['petition', petitionId] });
      queryClient.invalidateQueries({ queryKey: ['petitions'] }); // Invalidate list view
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Detalles del error de mutación:", error);
      toast.error('Error al actualizar. Revisa la consola del navegador para más detalles.');
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleUpdate = (formData: any) => {
    updateMutation.mutate({ id: petitionId, payload: formData });
  };

  if (isLoadingPetition || isLoadingPostulations) {
    return <div>Cargando...</div>;
  }

  if (isError) {
    return <div>Error al cargar la petición.</div>;
  }

  if (!petition) {
    return <div>Petición no encontrada.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      {isEditing ? (
        <PetitionEditForm
          petition={petition}
          onSave={handleUpdate}
          onCancel={handleCancelEdit}
          isLoading={updateMutation.isPending}
        />
      ) : (
        <PetitionDetail
          petition={petition}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default PetitionDetailPage;
