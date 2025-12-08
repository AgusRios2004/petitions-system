'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postulationService } from '@/service/postulationService';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { IPostulation } from '@/types/common';
import { useAuth } from '@/context/AuthContext';
import { getStatusColor } from '@/helpers/statusHelper';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

const ACCEPTED_STATE_ID = 1;
const REJECTED_STATE_ID = 2;

export default function PostulationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const postulationId = params.id as string;

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    confirmButtonVariant: 'primary' | 'destructive';
  } | null>(null);

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

      router.push('/profile');
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
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
      router.push('/profile');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al rechazar la postulación');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => postulationService.withdrawPostulation(postulationId, { id_user_update: user!.id_user }),
    onSuccess: () => {
      toast.success('Postulación retirada con éxito');
      queryClient.invalidateQueries({ queryKey: ['postulation', postulationId] });
      queryClient.invalidateQueries({ queryKey: ['providerPostulations', user?.provider?.id_provider] });
      queryClient.invalidateQueries({ queryKey: ['openPetitions'] });
      router.push('/profile');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al retirar la postulación');
    },
  });

  if (isLoading) return <p>Cargando detalles de la postulación...</p>;
  if (error) return <p>Error al cargar la postulación: {error.message}</p>;
  if (!postulationData || !postulationData.data) return <p>Postulación no encontrada.</p>;

  const postulation = postulationData.data;

  const handleAccept = () => {
    setConfirmation({
      isOpen: true,
      title: 'Aceptar Postulación',
      message: '¿Está seguro de que desea aceptar esta postulación? Esta acción marcará la postulación como ganadora y finalizará la petición.',
      onConfirm: () => {
        acceptMutation.mutate();
        setConfirmation(null);
      },
      confirmText: 'Aceptar',
      confirmButtonVariant: 'primary'
    });
  };

  const handleDecline = () => {
    setConfirmation({
      isOpen: true,
      title: 'Rechazar Postulación',
      message: '¿Está seguro de que desea rechazar esta postulación?',
      onConfirm: () => {
        declineMutation.mutate();
        setConfirmation(null);
      },
      confirmText: 'Rechazar',
      confirmButtonVariant: 'destructive'
    });
  };

  const handleWithdraw = () => {
    setConfirmation({
      isOpen: true,
      title: 'Retirar Postulación',
      message: '¿Está seguro de que desea retirar esta postulación?',
      onConfirm: () => {
        withdrawMutation.mutate();
        setConfirmation(null);
      },
      confirmText: 'Retirar',
      confirmButtonVariant: 'destructive'
    });
  };

  const isOwner = user?.customer?.id_customer === postulation.petition.customers.id_customer;
  const isProviderPostulant = user?.provider?.id_provider === postulation.id_provider;

  console.log('Postulation Data:', postulation);
  
  return (
    <>
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Detalles de la Postulación</h1>

        <div className="border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Petición Original</h2>
          <p className="text-gray-800 mb-2 line-clamp-3">{postulation.petition.description}</p>
          <Link href={`/petition/${postulation.petition.id_petition}`} className="text-sm text-blue-600 hover:underline">
            Ver petición completa
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600 text-sm">Estado</p>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(postulation.states.state)}`}>
              {postulation.states.state}
            </span>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Costo Ofertado</p>
            <p className="text-2xl font-bold text-gray-900">${postulation.cost}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Propuesta del Proveedor</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <p className="font-semibold text-gray-800">{postulation.createdBy.name} {postulation.createdBy.lastname}</p>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{postulation.proposal}</p>
          </div>
        </div>

        {postulation.inventories && postulation.inventories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Artículos Incluidos</h3>
            <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {postulation.inventories.map((item: any) => (
                <li key={item.id_inventory} className="text-gray-800">
                  <span className="font-semibold">{item.article.name}</span> - Cantidad: {item.quantity} - Costo: ${item.cost}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1 mb-8">
          <p>Postulación creada el: {new Date(postulation.date_create).toLocaleString()}</p>
          {postulation.date_update && (
            <p>Última actualización: {new Date(postulation.date_update).toLocaleString()}</p>
          )}
        </div>

        {/* --- SECCIÓN DE ACCIONES --- */}
        <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
          {/* --- ACCIONES DEL PROVEEDOR --- */}
          {/* Las acciones de editar/retirar solo están disponibles si el proveedor es el postulante y el estado es 'Pendiente' (ID 3) */}
          {isProviderPostulant && postulation.states.id_state === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tus Acciones</h2>
              <div className="flex gap-4">
                <Link href={`/postulation/edit/${postulation.id_postulation}`} className="flex-1">
                  <Button variant="primary" className="w-full">Editar Postulación</Button>
                </Link>
                <Button
                  onClick={handleWithdraw}
                  variant="destructive"
                  disabled={withdrawMutation.isPending}
                  className="flex-1"
                >
                  {withdrawMutation.isPending ? 'Retirando...' : 'Retirar Postulación'}
                </Button>
              </div>
            </div>
          )}
          
          {/* --- ACCIONES DEL CLIENTE --- */}
          {isOwner && postulation.states.id_state === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones</h2>
              
              {/* Botón de Perfil de Proveedor */}
              <div className="mb-4">
                <Link href={`/provider/${postulation.id_provider}`}>
                  <Button variant="ghost">Ver Perfil del Proveedor</Button>
                </Link>
              </div>

              {/* Contenedor Flex para que los botones se dividan el espacio 50/50 */}
              <div className="flex gap-4">
                <Button onClick={handleAccept} variant="primary" className="bg-green-600 hover:bg-green-700 flex-1" disabled={acceptMutation.isPending}>
                  {acceptMutation.isPending ? 'Aceptando...' : 'Aceptar Postulación'}
                </Button>
                <Button onClick={handleDecline} variant="destructive" className="flex-1" disabled={declineMutation.isPending}>
                  {declineMutation.isPending ? 'Rechazando...' : 'Rechazar'}
                </Button>
              </div>
            </div>
          )}

          {/* --- NAVEGACIÓN Y ACCIONES GENERALES --- */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <Button onClick={() => router.back()} variant="secondary">Volver</Button>
          </div>
        </div>
      </div>
    </div>
    {confirmation && (
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation(null)}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        isConfirming={acceptMutation.isPending || declineMutation.isPending || withdrawMutation.isPending}
        confirmButtonVariant={confirmation.confirmButtonVariant}
      />
    )}
    </>
  );
}
