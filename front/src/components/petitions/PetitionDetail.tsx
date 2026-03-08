import React from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelPetition } from '@/service/petitionService';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { SOCKET_URL } from '@/service/socketService';

interface Petition {
  id_petition: number;
  description: string;
  date_create: string;
  date_update: string;
  date_since: string;
  date_until: string;
  id_state: number;
  id_type_petition: number;
  id_type_provider: number;
  id_profession: number;
  id_customer: number;
  id_user_create: number;
  id_user_update: number;
  is_deleted: boolean;

  customers: {
    id_customer: number;
    user_id: number;
    dni: string;
    phone: string;
    address_id: number;
  };

  profession: {
    id_profession: number;
    name: string;
  };

  states: {
    id_state: number;
    state: string;
    description: string;
    code: string;
  };

  typePetitions: {
    id_type_petition: number;
    name: string;
  };

  typeProvider: {
    id_type_provider: number;
    name: string;
  };

  attachments?: {
    id_attachment: number;
    name: string;
    path: string;
  }[];

  categories?: {
    id_category: number;
    name: string;
  }[];
}

interface PetitionDetailProps {
  petition: Petition;
  onEdit: (id: number) => void;
}

import PetitionPostulations from '@/components/postulations/PetitionPostulations';

const PetitionDetail: React.FC<PetitionDetailProps> = ({ petition, onEdit }) => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPostulations, setShowPostulations] = React.useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);

  const isOwner = user?.customer?.id_customer === petition.customers?.id_customer;

  const togglePostulations = () => setShowPostulations(!showPostulations);

  const cancelMutation = useMutation({
    mutationFn: () => cancelPetition(petition.id_petition),
    onSuccess: () => {
      toast.success('Petición cancelada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      router.push('/profile');
      setIsCancelModalOpen(false);
    },
    onError: (error) => {
      console.error('Error al cancelar la petición:', error);
      toast.error('Hubo un error al cancelar la petición');
      setIsCancelModalOpen(false);
    },
  });

  const handleCancelPetition = () => {
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    cancelMutation.mutate();
  };


  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto p-4">
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {petition.profession?.name || 'Sin título'}
            </h1>
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
              {petition.states?.state || 'Sin Estado'}
            </span>
          </div>

          <div className="mb-6 pb-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Descripción</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{petition.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <span className="font-medium text-gray-400">Tipo de Petición: </span>
              <span className="text-gray-200">{petition.typePetitions?.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-400">Tipo de Proveedor: </span>
              <span className="text-gray-200">{petition.typeProvider?.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-400">Desde: </span>
              <span className="text-gray-200">{new Date(petition.date_since).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-400">Hasta: </span>
              <span className="text-gray-200">{new Date(petition.date_until).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-400">Teléfono: </span>
              <span className="text-gray-200">{petition.customers?.phone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-400">Fecha de Creación: </span>
              <span className="text-gray-200">{new Date(petition.date_create).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-400">Última Actualización: </span>
              <span className="text-gray-200">{new Date(petition.date_update).toLocaleDateString()}</span>
            </div>
            {petition.states?.description && (
              <div>
                <span className="font-medium text-gray-400">Descripción del Estado: </span>
                <span className="text-gray-200">{petition.states.description}</span>
              </div>
            )}

            {/* Mostrar Categorías si existen */}
            {petition.categories && petition.categories.length > 0 && (
              <div className="col-span-1 md:col-span-2 mt-2">
                <span className="font-medium text-gray-400 block mb-2">Categorías de Interés: </span>
                <div className="flex flex-wrap gap-2">
                  {petition.categories.map((cat) => (
                    <span key={cat.id_category} className="bg-blue-900/40 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full border border-blue-700">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-200">Adjuntos</h3>
              {isOwner && !user?.provider && (petition.id_state === 1 || petition.id_state === 3) && (
                <Link href={`/petition/${petition.id_petition}/add-attachment`}>
                  <Button size="sm" variant="secondary">Gestionar Adjuntos</Button>
                </Link>
              )}
            </div>
            {petition.attachments && petition.attachments.length > 0 ? (
              <ul className="list-disc list-inside pl-2 text-gray-300">
                {petition.attachments.map((file) => (
                  <li key={file.id_attachment}>
                    <a
                      href={`${SOCKET_URL}/${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      {file.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No hay adjuntos en esta petición.</p>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-end gap-3 border-t border-gray-700/50 pt-6">
            <Button
              onClick={() => router.push('/profile')}
              variant="secondary"
              className="w-full sm:w-auto order-last sm:order-first"
            >
              Volver
            </Button>
            {/* El botón de postulación aparece si el usuario es un proveedor y no el dueño de la petición. */}
            {!isOwner && user?.provider && petition.states.state === 'Pendiente' && (
              <Link href={`/postulation/create/${petition.id_petition}`} className="w-full sm:w-auto">
                <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700 font-bold">Postularse</Button>
              </Link>
            )}

            {isOwner && (petition.id_state === 1 || petition.id_state === 3) && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => onEdit(petition.id_petition)}
                  variant="primary"
                  className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto font-bold"
                >
                  Editar
                </Button>
                <Button
                  onClick={handleCancelPetition}
                  variant="destructive"
                  className="w-full sm:w-auto font-bold"
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar petición'}
                </Button>
              </div>
            )}

            {isOwner && (
              <Button
                onClick={togglePostulations}
                variant="primary"
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto font-bold"
              >
                {showPostulations ? 'Ocultar Postulaciones' : 'Ver Postulaciones'}
              </Button>
            )}
          </div>
        </div>
        {showPostulations && (
          <div className="mt-4">
            <PetitionPostulations petitionId={petition.id_petition} />
          </div>
        )}
        <ConfirmationModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={confirmCancel}
          title="Confirmar Cancelación"
          message="¿Estás seguro de que quieres cancelar esta petición? Esta acción no se puede deshacer."
          confirmText="Sí, cancelar"
          isConfirming={cancelMutation.isPending}
          confirmButtonVariant="destructive"
        />
      </div>
    </div>
  )
}

export default PetitionDetail;