import React from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelPetition } from '@/service/petitionService';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

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
  console.log('PetitionDetail Props:', petition);

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
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {petition.profession?.name || 'Sin título'}
          </h1>
          <span className="bg-red-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full">
            {petition.states?.state || 'Sin Estado'}
          </span>
        </div>

        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Descripción</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{petition.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="font-medium text-gray-500">Tipo de Petición: </span>
            <span className="text-gray-800">{petition.typePetitions?.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Tipo de Proveedor: </span>
            <span className="text-gray-800">{petition.typeProvider?.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Desde: </span>
            <span className="text-gray-800">{new Date(petition.date_since).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Hasta: </span>
            <span className="text-gray-800">{new Date(petition.date_until).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Teléfono: </span>
            <span className="text-gray-800">{petition.customers?.phone}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Fecha de Creación: </span>
            <span className="text-gray-800">{new Date(petition.date_create).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Última Actualización: </span>
            <span className="text-gray-800">{new Date(petition.date_update).toLocaleDateString()}</span>
          </div>
          {petition.states?.description && (
            <div>
              <span className="font-medium text-gray-500">Descripción del Estado: </span>
              <span className="text-gray-800">{petition.states.description}</span>
            </div>
          )}
          
          {/* Mostrar Categorías si existen */}
          {petition.categories && petition.categories.length > 0 && (
            <div className="col-span-1 md:col-span-2 mt-2">
              <span className="font-medium text-gray-500 block mb-2">Categorías de Interés: </span>
              <div className="flex flex-wrap gap-2">
                {petition.categories.map((cat) => (
                  <span key={cat.id_category} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Adjuntos</h3>
            {isOwner && !user?.provider && petition.id_state == 3 && (
              <Link href={`/petition/${petition.id_petition}/add-attachment`}>
                <Button size="sm" variant="secondary">Gestionar Adjuntos</Button>
              </Link>
            )}
          </div>
          {petition.attachments && petition.attachments.length > 0 ? (
            <ul className="list-disc list-inside pl-2 text-gray-400">
              {petition.attachments.map((file) => (
                <li key={file.id_attachment}>
                  <a
                    href={`http://localhost:3000/${file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline hover:text-blue-600"
                  >
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay adjuntos en esta petición.</p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-4">
          <Button
            onClick={() => router.push('/profile')}
            variant="secondary"
            className="flex-1 min-w-[120px]"
          >
            Volver
          </Button>
          {/* El botón de postulación aparece si el usuario es un proveedor y no el dueño de la petición. */}
          {!isOwner && user?.provider && petition.states.state === 'Pendiente' &&(
            <Link href={`/postulation/create/${petition.id_petition}`} className="flex-1 min-w-[120px]">
              <Button variant="primary" className="w-full">Postularse</Button>
            </Link>
          )}
          
          {isOwner && petition.id_state == 3 && (
            <>
              <Button
                onClick={() => onEdit(petition.id_petition)}
                variant="primary"
                className="bg-yellow-500 hover:bg-yellow-600 flex-1 min-w-[120px]"
              >
                Editar
              </Button>
              <Button
                onClick={handleCancelPetition}
                variant="destructive"
                className="flex-1 min-w-[120px]"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar petición'}
              </Button>
            </>
          )}
        </div>
        <div className='mt-4'>
          {isOwner && (
            <Button
              onClick={togglePostulations}
              variant="primary"
              className="bg-green-500 hover:bg-green-600 flex-1 min-w-[120px]"
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
    </div>)}

    export default PetitionDetail;