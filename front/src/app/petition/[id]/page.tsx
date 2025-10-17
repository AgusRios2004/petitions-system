
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPetitionById, updatePetition, deletePetition } from '@/service/petitionService';
import PetitionDetail from '@/components/petitions/PetitionDetail';
import toast from 'react-hot-toast';
// Placeholder for the form component we will create
import PetitionEditForm from '@/components/petitions/PetitionEditForm'; 

const PetitionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const petitionId = parseInt(id, 10);

  const [isEditing, setIsEditing] = useState(false);

  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey: ['petition', petitionId],
    queryFn: () => getPetitionById(petitionId),
    enabled: !!petitionId,
  });

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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePetition(id),
    onSuccess: () => {
      toast.success('Petición eliminada con éxito');
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      router.push('/petition'); // Redirect to petitions list
    },
    onError: () => {
      toast.error('Error al eliminar la petición');
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

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta petición?')) {
      deleteMutation.mutate(petitionId);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (isError) {
    return <div>Error al cargar la petición.</div>;
  }

  const petition = apiResponse?.data;

  if (!petition) {
    return <div>Petición no encontrada.</div>;
  }

  return (
    <div>
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
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default PetitionDetailPage;
