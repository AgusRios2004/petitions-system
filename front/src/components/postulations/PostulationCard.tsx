import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { getStatusColor } from '@/helpers/statusHelper';
import { IPostulation } from '@/types/common';
import RatingModal from '../petitions/RatingModal';
import { useAuth } from '@/context/AuthContext';
import { startConversation } from '@/service/messageService';
import { postulationService } from '@/service/postulationService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MessageSquare, Check, X, ClipboardCheck, Award, Calendar, DollarSign, FileText, User as UserIcon, Edit, Trash2, Eye } from 'lucide-react';
import * as petitionService from '@/service/petitionService';

interface PostulationCardProps {
  postulation: IPostulation;
  role: 'provider' | 'customer';
}

const PostulationCard: React.FC<PostulationCardProps> = ({ postulation, role }) => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRatingModalOpen, setRatingModalOpen] = useState(false);

  const isPending = postulation.states.id_state === 1 || postulation.states.state === 'Pendiente';

  const acceptMutation = useMutation({
    mutationFn: () => postulationService.acceptPostulation(postulation.id_postulation.toString()),
    onSuccess: () => {
      toast.success('Postulación aceptada correctamente');
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
      queryClient.invalidateQueries({ queryKey: ['petition'] });
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aceptar la postulación');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () => postulationService.rejectPostulation(postulation.id_postulation.toString(), { id_user_update: user!.id_user }),
    onSuccess: () => {
      toast.success('Postulación rechazada');
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al rechazar la postulación');
    }
  });

  const finishMutation = useMutation({
    mutationFn: () => postulationService.finishPostulation(postulation.id_postulation.toString()),
    onSuccess: () => {
      toast.success('Trabajo marcado como finalizado. Esperando confirmación del cliente.');
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al finalizar el trabajo');
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => petitionService.completePetition(postulation.petition.id_petition),
    onSuccess: () => {
      toast.success('Trabajo confirmado. ¡Gracias!');
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
      queryClient.invalidateQueries({ queryKey: ['petition'] });
      setRatingModalOpen(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al completar la petición');
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: () => postulationService.withdrawPostulation(postulation.id_postulation.toString(), { id_user_update: user!.id_user }),
    onSuccess: () => {
      toast.success('Postulación retirada con éxito');
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al retirar la postulación');
    }
  });

  const handleMessage = async () => {
    if (!postulation.createdBy?.id_user || !postulation.petition?.id_petition) return;
    try {
      const targetUserId = role === 'customer' ? postulation.createdBy.id_user : postulation.petition.customers.user_id;
      const conversation = await startConversation(targetUserId, postulation.petition.id_petition);
      router.push(`/message/${conversation.id_conversation}`);
    } catch (error) {
      console.error("Error al iniciar la conversación:", error);
      toast.error("No se pudo iniciar la conversación");
    }
  };

  return (
    <div className="group bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
        {postulation.winner && (
          <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-2 py-1 rounded-full border border-yellow-500/20 uppercase tracking-tighter shadow-sm animate-pulse">
            <Award size={10} /> Ganador
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
            {postulation.createdBy?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full">
              {postulation.createdBy?.provider?.id_provider ? (
                <Link
                  href={`/provider/${postulation.createdBy.provider.id_provider}`}
                  className="text-lg font-bold text-white hover:text-blue-400 transition-colors truncate"
                >
                  {postulation.createdBy.name} {postulation.createdBy.lastname}
                </Link>
              ) : (
                <p className="text-lg font-bold text-white truncate">
                  {postulation.createdBy?.name} {postulation.createdBy?.lastname}
                </p>
              )}
              <span className={`inline-flex w-fit text-[11px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm ${getStatusColor(postulation.states.state)}`}>
                {postulation.states.state.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
              <Calendar size={12} />
              <span>{new Date(postulation.date_create).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 space-y-3">
            <div className="flex gap-3">
              <FileText size={16} className="text-blue-400 shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Descripción de Petición</p>
                <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 md:line-clamp-none italic">
                  {postulation.petition?.description}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-3 border-t border-gray-700/50">
              <FileText size={16} className="text-emerald-400 shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Propuesta del Proveedor</p>
                <p className="text-sm text-gray-100 font-medium">
                  {postulation.proposal}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Inversión Estimada</p>
                <p className="text-2xl font-black text-emerald-400">${postulation.cost}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Action Row 1: Role Specific Principal Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {role === 'provider' && isPending && (
              <>
                <Link href={`/postulation/edit/${postulation.id_postulation}`} className="w-full">
                  <Button variant='primary' className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/10 font-bold">
                    <Edit size={18} className="mr-2" /> Editar Postulación
                  </Button>
                </Link>
                <Button
                  variant='destructive'
                  className="w-full h-11 border-red-500/20 hover:bg-red-500/10 font-bold"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres retirar tu postulación?')) {
                      withdrawMutation.mutate();
                    }
                  }}
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? 'Procesando...' : <><Trash2 size={18} className="mr-2" /> Retirar Postulación</>}
                </Button>
              </>
            )}

            {role === 'customer' && isPending && (
              <>
                <Button
                  variant='primary'
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10"
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending || rejectMutation.isPending}
                >
                  <Check size={18} className="mr-2" /> {acceptMutation.isPending ? 'Aceptando...' : 'Aceptar'}
                </Button>
                <Button
                  variant='destructive'
                  className="w-full h-11"
                  onClick={() => rejectMutation.mutate()}
                  disabled={acceptMutation.isPending || rejectMutation.isPending}
                >
                  <X size={18} className="mr-2" /> {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar'}
                </Button>
              </>
            )}

            {role === 'provider' && postulation.winner && postulation.states.state === 'Aceptado' && (
              <Button
                variant='primary'
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 col-span-full"
                onClick={() => finishMutation.mutate()}
                disabled={finishMutation.isPending}
              >
                <ClipboardCheck size={18} className="mr-2" /> {finishMutation.isPending ? 'Procesando...' : 'Marcar como Finalizado'}
              </Button>
            )}

            {role === 'customer' && postulation.winner && postulation.states.state === 'Finalizado' && (
              <Button
                variant='primary'
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold col-span-full"
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
              >
                <Award size={18} className="mr-2" /> {completeMutation.isPending ? 'Confirmando...' : 'Confirmar Trabajo y Calificar'}
              </Button>
            )}
          </div>

          {/* Action Row 2: Secondary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant='secondary'
              className="w-full h-11 bg-gray-800/50 hover:bg-gray-800 font-bold"
              onClick={handleMessage}
            >
              <MessageSquare size={18} className="mr-2" /> Mensaje
            </Button>

            <Link href={`/postulation/${postulation.id_postulation}`} className="w-full">
              <Button variant='secondary' className="w-full h-11 bg-gray-800/50 hover:bg-gray-800 font-bold">
                <Eye size={18} className="mr-2" /> Ver Detalles Completos
              </Button>
            </Link>
          </div>

          {((role === 'provider' && user?.provider) || role === 'customer') && postulation.winner && (postulation.states.state === 'Aceptado' || postulation.states.state === 'Finalizado') && (
            <Button
              variant='primary'
              className="w-full h-11 bg-yellow-600 hover:bg-yellow-700 shadow-lg shadow-yellow-600/10 mt-1"
              onClick={() => setRatingModalOpen(true)}
            >
              <Award size={18} className="mr-2" /> {role === 'customer' ? 'Calificar Proveedor' : 'Calificar Cliente'}
            </Button>
          )}
        </div>
      </div>

      {isRatingModalOpen && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          petitionId={postulation.petition.id_petition}
          providerId={postulation.createdBy.provider!.id_provider}
          customerId={postulation.petition.customers.id_customer}
          ratingTarget={role === 'customer' ? 'provider' : 'customer'}
        />
      )}
    </div>
  );
};

export default PostulationCard;
