'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPetitionById, updatePetition } from '@/service/petitionService';
import PetitionDetail from '@/components/petitions/PetitionDetail';
import PetitionEditForm from '@/components/petitions/PetitionEditForm';
import toast from 'react-hot-toast';

export default function PetitionPage() {
  const params = useParams();
  const id = Number(params.id);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: petition, isLoading, isError } = useQuery({
    queryKey: ['petition', id],
    queryFn: () => getPetitionById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      return updatePetition(id, data);
    },
    onSuccess: () => {
      toast.success('Petición actualizada correctamente');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['petition', id] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Error al actualizar la petición');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError || !petition) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-gray-300">
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p>No se pudo cargar la petición o no existe.</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-950 py-8">
        <PetitionEditForm
          petition={petition}
          onSave={(data) => updateMutation.mutate(data)}
          onCancel={() => setIsEditing(false)}
          isLoading={updateMutation.isPending}
        />
      </div>
    );
  }

  return <PetitionDetail petition={petition} onEdit={() => setIsEditing(true)} />;
}