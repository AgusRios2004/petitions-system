import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { getStatusColor } from '@/helpers/statusHelper';
import { IPostulation } from '@/types/common';
import RatingModal from '../petitions/RatingModal'; // Asegúrate que la ruta sea correcta
import { useAuth } from '@/context/AuthContext';
import { startConversation } from '@/service/messageService';
import { postulationService } from '@/service/postulationService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MessageSquare, Check, X } from 'lucide-react';

interface PostulationCardProps {
  postulation: IPostulation;
  role: 'provider' | 'customer';
}

const PostulationCard: React.FC<PostulationCardProps> = ({ postulation, role }) => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRatingModalOpen, setRatingModalOpen] = useState(false);

  // En el seed actual: 1 = Pendiente, 2 = Aceptado, 3 = Rechazado...
  const isPending = postulation.states.id_state === 1 || postulation.states.state === 'Pendiente';
  const isPostulationInactive = !isPending;

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

  console.log('PostulationCard Props:', postulation)

  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700 text-gray-100">
      <div className="flex justify-between items-start">
        <div>
          {postulation.createdBy?.provider?.id_provider ? (
            <Link href={`/provider/${postulation.createdBy.provider.id_provider}`} className="text-lg font-semibold text-white hover:underline">
              {postulation.createdBy.name} {postulation.createdBy.lastname}
            </Link>
          ) : (
            <p className="text-lg font-semibold text-white">
              {postulation.createdBy?.name} {postulation.createdBy?.lastname}
            </p>
          )}
          <p className="text-sm text-gray-300 mt-2">{postulation.petition?.description}</p>
          <p className="text-sm text-gray-200 mt-1">Propuesta: {postulation.proposal}</p>
          <p className="text-sm font-bold text-white mt-1">Costo: ${postulation.cost}</p>
        </div>
        <div className="text-right">
          {postulation.winner ? (
            <span className={`mt-2 inline-block text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor('Aceptado')}`}>
              Ganador
            </span>
          ) : (
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(postulation.states.state)}`}>
              {postulation.states.state}
            </span>
          )}
        </div>
      </div>
      <div className='flex justify-end mt-4 gap-2'>
        {role === 'provider' && !isPostulationInactive && (
          <Link href={`/postulation/edit/${postulation.id_postulation}`}>
            <Button variant='primary' fullWidth={false}>Editar</Button>
          </Link>
        )}
        {/* --- INICIO: Botón para iniciar conversación --- */}
        {role === 'customer' && isPending && (
          <>
            <Button
              variant='primary'
              fullWidth={false}
              className="bg-green-600 hover:bg-green-700"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending || rejectMutation.isPending}
            >
              <Check size={16} className="mr-2" /> {acceptMutation.isPending ? 'Aceptando...' : 'Aceptar'}
            </Button>
            <Button
              variant='destructive'
              fullWidth={false}
              onClick={() => rejectMutation.mutate()}
              disabled={acceptMutation.isPending || rejectMutation.isPending}
            >
              <X size={16} className="mr-2" /> {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar'}
            </Button>
          </>
        )}
        {role === 'customer' && (
          <Button
            variant='secondary'
            fullWidth={false}
            onClick={async () => {
              if (!postulation.createdBy?.id_user || !postulation.petition?.id_petition) return;
              try {
                const conversation = await startConversation(postulation.createdBy.id_user, postulation.petition.id_petition);
                router.push(`/message/${conversation.id_conversation}`);
              } catch (error) {
                console.error("Error al iniciar la conversación:", error);
              }
            }}
          >
            <MessageSquare size={16} className="mr-2" /> Enviar Mensaje
          </Button>
        )}
        <Link href={`/postulation/${postulation.id_postulation}`}>
          <Button variant='secondary' fullWidth={false}>Ver detalles</Button>
        </Link>

        {role === 'provider' && postulation.winner && user?.provider && (
          <Button variant='primary' fullWidth={false} onClick={() => setRatingModalOpen(true)}>
            Calificar Cliente
          </Button>
        )}
      </div>
      <div className="text-right text-xs text-gray-400 mt-4">
        Postulado el: {new Date(postulation.date_create).toLocaleDateString()}
      </div>

      {/* Renderiza el modal si está abierto, ahora es más flexible */}
      {isRatingModalOpen && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          // El proveedor a calificar es quien creó la postulación.
          providerId={postulation.createdBy.provider!.id_provider}
          // El cliente a calificar es quien creó la petición original.
          // Se usa el 'user' logueado si es el cliente quien califica, o se extrae de la petición si es el proveedor.
          customerId={
            role === 'customer'
              ? user!.customer!.id_customer
              : postulation.petition!.customers.id_customer
          }
          // El objetivo de la calificación depende del rol del usuario actual.
          ratingTarget={role === 'customer' ? 'provider' : 'customer'}
        />
      )}
    </div>
  );
};

export default PostulationCard;
