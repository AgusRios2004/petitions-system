'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postulationService } from '@/service/postulationService';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { IPostulation } from '@/types/common';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const ACCEPTED_STATE_ID = 1;
const REJECTED_STATE_ID = 2;

export default function PostulationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const postulationId = params.id as string;

  const { data: postulationData, isLoading, error } = useQuery<{ data: IPostulation }>({ 
    queryKey: ['postulation', postulationId],
    queryFn: () => postulationService.getPostulationById(postulationId),
    enabled: !!postulationId,
  });

  const acceptMutation = useMutation({
    mutationFn: () => postulationService.acceptPostulation(postulationId),
    onSuccess: () => {
      toast.success('Postulación aceptada con éxito');
      queryClient.invalidateQueries({ queryKey: ['postulation', postulationId] });
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
      queryClient.invalidateQueries({ queryKey: ['petitions'] });

      setTimeout(() => {
        alert('¡Volverá al menú principal!');
        router.push('/profile');
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al aceptar la postulación');
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => postulationService.declinePostulation(postulationId, { id_user_update: user!.id_user }),
    onSuccess: () => {
      toast.success('Postulación rechazada');
      queryClient.invalidateQueries({ queryKey: ['postulation', postulationId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al rechazar la postulación');
    },
  });

  if (isLoading) return <p>Cargando detalles de la postulación...</p>;
  if (error) return <p>Error al cargar la postulación: {error.message}</p>;
  if (!postulationData || !postulationData.data) return <p>Postulación no encontrada.</p>;

  const postulation = postulationData.data;

  const handleBack = () => {
    if (user?.customer) {
      router.push(`/petition/${postulation.petition.id_petition}`);
    } else {
      router.back();
    }
  };

  const handleAccept = () => {
    if (window.confirm('¿Está seguro de que desea aceptar esta postulación? Esta acción marcará la postulación como ganadora.')) {
      acceptMutation.mutate();
    }
  };

  const handleDecline = () => {
    if (window.confirm('¿Está seguro de que desea rechazar esta postulación?')) {
      declineMutation.mutate();
    }
  };

  const isOwner = user?.customer?.id_customer === postulation.petition.customers.id_customer;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Detalles de la Postulación</h1>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600 text-sm">Petición:</p>
            <p className="text-lg font-semibold text-gray-900">{postulation.petition.description}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Propuesta:</p>
            <p className="text-gray-800">{postulation.proposal}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Costo Total:</p>
            <p className="text-lg font-semibold text-gray-900">${postulation.cost}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Estado:</p>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              postulation.states.state === 'Abierta' ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'
            }`}>
              {postulation.states.state}
            </span>
          </div>

          {postulation.inventories && postulation.inventories.length > 0 && (
            <div>
              <p className="text-gray-600 text-sm mb-2">Artículos:</p>
              <ul className="list-disc list-inside space-y-1">
                {postulation.inventories.map((item: any) => (
                  <li key={item.id_inventory} className="text-gray-800">
                    {item.article.name} - Cantidad: {item.quantity} - Costo: ${item.cost}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-gray-600 text-sm">Fecha de Creación:</p>
            <p className="text-gray-800">{new Date(postulation.date_create).toLocaleString()}</p>
          </div>

          {postulation.date_update && (
            <div>
              <p className="text-gray-600 text-sm">Última Actualización:</p>
              <p className="text-gray-800">{new Date(postulation.date_update).toLocaleString()}</p>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones del Cliente</h2>
            <div className="flex gap-4">
              <Button onClick={handleAccept} variant="primary" disabled={acceptMutation.isPending || postulation.winner}>
                {acceptMutation.isPending ? 'Aceptando...' : 'Aceptar Postulación'}
              </Button>
              <Button onClick={handleDecline} variant="destructive" disabled={declineMutation.isPending}>
                {declineMutation.isPending ? 'Rechazando...' : 'Rechazar'}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between items-center">
            <Button onClick={handleBack} variant="secondary">&larr; Volver</Button>
            {user?.provider && (
                <Link href={`/postulation/edit/${postulation.id_postulation}`}>
                    <Button variant="primary">Editar Postulación</Button>
                </Link>
            )}
        </div>
      </div>
    </div>
  );
}
