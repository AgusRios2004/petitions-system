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
    <div className="group bg-gray-900 border border-white/5 hover:border-blue-500/20 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-2xl relative mb-4 last:mb-0">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

      <div className="absolute top-6 right-6 z-10">
        {postulation.winner && (
          <span className="flex items-center gap-2 bg-yellow-500/20 text-yellow-500 text-[10px] font-black px-4 py-1.5 rounded-full border border-yellow-500/20 uppercase tracking-widest shadow-sm">
            <Award size={12} /> Ganador
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10 mb-8">
        {/* Left Section - Provider & State */}
        <div className="lg:w-1/3 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-blue-500/10">
              {postulation.createdBy?.name?.charAt(0) || 'U'}
            </div>
            <div>
              {postulation.createdBy?.provider?.id_provider ? (
                <Link
                  href={`/provider/${postulation.createdBy.provider.id_provider}`}
                  className="text-xl font-black text-white hover:text-blue-400 transition-colors block mb-1"
                >
                  {postulation.createdBy.name} {postulation.createdBy.lastname}
                </Link>
              ) : (
                <p className="text-xl font-black text-white mb-1">
                  {postulation.createdBy?.name} {postulation.createdBy?.lastname}
                </p>
              )}
              <div className={`inline-flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(postulation.states.state)}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {postulation.states.state}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Inversión Propuesta</p>
                <p className="text-2xl font-black text-white">${postulation.cost.toLocaleString('es-AR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500 text-[10px] px-2 uppercase font-black tracking-widest">
              <Calendar size={12} /> {new Date(postulation.date_create).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Right Section - Proposal Details */}
        <div className="flex-1 space-y-6 lg:border-l lg:border-white/5 lg:pl-8">
          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <FileText size={12} /> Propuesta del Profesional
              </h4>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 leading-relaxed text-gray-300 text-sm font-medium italic">
                {postulation.proposal}
              </div>
            </section>

            {postulation.inventories && postulation.inventories.length > 0 && (
              <section>
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Materiales e Insumos</h4>
                <div className="flex flex-wrap gap-2">
                  {postulation.inventories.map((item) => (
                    <div key={item.id_inventory} className="bg-gray-800/80 px-4 py-2 rounded-xl text-xs text-gray-400 border border-white/5">
                      <span className="font-black text-white">{item.article?.name}</span> (x{item.quantity})
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col gap-4 relative z-10 pt-6 border-t border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {role === 'provider' && isPending && (
            <>
              <Link href={`/postulation/edit/${postulation.id_postulation}`} className="w-full">
                <Button variant='primary' className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/10 font-bold">
                  <Edit size={18} className="mr-2" /> Editar Postulación
                </Button>
              </Link>
              <Button
                variant='destructive'
                className="w-full h-12 border-red-500/20 hover:bg-red-500/10 font-bold"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres retirar tu postulación?')) {
                    withdrawMutation.mutate();
                  }
                }}
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? 'Procesando...' : <><Trash2 size={18} className="mr-2" /> Retirar</>}
              </Button>
            </>
          )}

          {role === 'customer' && isPending && (
            <>
              <Button
                variant='primary'
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 font-black text-xs uppercase tracking-widest"
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
              >
                <Check size={18} className="mr-2" /> {acceptMutation.isPending ? 'Aceptando...' : 'Aceptar Postulación'}
              </Button>
              <Button
                variant='destructive'
                className="w-full h-12 font-black text-xs uppercase tracking-widest"
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
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 col-span-full font-black text-xs uppercase tracking-widest"
              onClick={() => finishMutation.mutate()}
              disabled={finishMutation.isPending}
            >
              <ClipboardCheck size={18} className="mr-2" /> {finishMutation.isPending ? 'Procesando...' : 'Marcar como Finalizado'}
            </Button>
          )}

          {role === 'customer' && postulation.winner && postulation.states.state === 'Finalizado' && (
            <Button
              variant='primary'
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold col-span-full font-black text-xs uppercase tracking-widest"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
            >
              <Award size={18} className="mr-2" /> {completeMutation.isPending ? 'Confirmando...' : 'Confirmar Trabajo'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant='secondary'
            className="w-full h-11 bg-gray-800/50 hover:bg-gray-800 font-bold"
            onClick={handleMessage}
          >
            <MessageSquare size={18} className="mr-2" /> Enviar Mensaje
          </Button>

          <Link href={`/postulation/${postulation.id_postulation}`} className="w-full">
            <Button variant='secondary' className="w-full h-11 bg-gray-800/50 hover:bg-gray-800 font-bold w-full">
              <Eye size={18} className="mr-2" /> Ver Detalles
            </Button>
          </Link>
        </div>

        {((role === 'provider' && user?.provider) || role === 'customer') && postulation.winner && (postulation.states.state === 'Aceptado' || postulation.states.state === 'Finalizado') && (
          <Button
            variant='primary'
            className="w-full h-11 bg-yellow-600 hover:bg-yellow-700 shadow-lg shadow-yellow-600/10"
            onClick={() => setRatingModalOpen(true)}
          >
            <Award size={18} className="mr-2" /> {role === 'customer' ? 'Calificar Proveedor' : 'Calificar Cliente'}
          </Button>
        )}
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
