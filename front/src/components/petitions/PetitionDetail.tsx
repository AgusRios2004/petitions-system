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
    <div className="min-h-screen bg-transparent py-4 sm:py-8">
      <div className="container mx-auto px-1 sm:px-4">
        <div className="bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 border border-white/5 animate-in fade-in zoom-in-95 duration-500">

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10 pb-10 border-b border-white/5">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-950/20">
                  {petition.typePetitions?.name}
                </span>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-orange-950/20">
                  {petition.states?.state || 'Sin Estado'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight uppercase">
                {petition.profession?.name || 'Sin título'}
              </h1>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-xl border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-tighter">Publicado {new Date(petition.date_create).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Button onClick={() => router.push('/profile')} variant="secondary" className="flex-1 lg:flex-none h-14 px-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all uppercase tracking-widest text-xs">
                Volver
              </Button>
              {isOwner && (
                <>
                  <Button onClick={() => onEdit(petition.id_petition)} className="flex-1 lg:flex-none h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/40 font-bold transition-all uppercase tracking-widest text-xs">
                    Editar
                  </Button>
                  <Button onClick={handleCancelPetition} variant="destructive" className="flex-1 lg:flex-none h-14 px-8 rounded-2xl border border-red-900/20 font-bold transition-all uppercase tracking-widest text-xs" disabled={cancelMutation.isPending}>
                    {cancelMutation.isPending ? 'Procesando...' : 'Anular'}
                  </Button>
                </>
              )}
              {!isOwner && user?.provider && petition.states.state === 'Pendiente' && (
                <Link href={`/postulation/create/${petition.id_petition}`} className="flex-1 lg:flex-none">
                  <Button variant="primary" className="w-full h-14 px-10 rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-900/40 font-black uppercase tracking-widest text-xs">
                    Postularme
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1 h-6 bg-blue-500 rounded-full" />
                  Descripción del Proyecto
                </h2>
                <div className="p-8 bg-white/5 rounded-3xl border border-white/5 leading-relaxed text-gray-300 text-lg shadow-inner">
                  {petition.description}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1 h-6 bg-blue-500 rounded-full" />
                  Archivos y Adjuntos
                </h2>
                {petition.attachments && petition.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {petition.attachments.map((file) => (
                      <a key={file.id_attachment} href={`${SOCKET_URL}/${file.path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-white/5 rounded-2xl transition-all group">
                        <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
                          DOC
                        </div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-blue-400 transition-colors truncate">{file.name}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 border-2 border-dashed border-white/5 rounded-3xl text-center text-gray-500 italic">
                    No se han adjuntado archivos.
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-800/40 rounded-3xl border border-white/5 p-8 backdrop-blur-md">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-4">Detalles Técnicos</h3>
                <div className="space-y-6">
                  <DetailRow label="Proveedor" value={petition.typeProvider?.name} />
                  <DetailRow label="Duración" value={`${new Date(petition.date_since).toLocaleDateString()} - ${new Date(petition.date_until).toLocaleDateString()}`} />
                  <DetailRow label="Contacto" value={petition.customers?.phone} />
                  <DetailRow label="Actualizado" value={new Date(petition.date_update).toLocaleDateString()} />
                </div>

                {petition.categories && petition.categories.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Categorías</span>
                    <div className="flex flex-wrap gap-2">
                      {petition.categories.map((cat) => (
                        <span key={cat.id_category} className="bg-blue-600/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/10 uppercase tracking-tighter">
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isOwner && (
                <Button onClick={togglePostulations} className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${showPostulations ? 'bg-gray-800 text-white' : 'bg-green-600 hover:bg-green-700 shadow-xl shadow-green-950/40'}`}>
                  {showPostulations ? 'Ocultar Postulaciones' : 'Ver Postulaciones'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {showPostulations && (
          <div className="mt-10 animate-in slide-in-from-top-4 fade-in duration-300">
            <PetitionPostulations petitionId={petition.id_petition} />
          </div>
        )}

        <ConfirmationModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={confirmCancel}
          title="Anular Petición"
          message="¿Estás seguro de que deseas anular esta petición? Los profesionales no podrán enviar más propuestas."
          confirmText="Anular definitivamente"
          isConfirming={cancelMutation.isPending}
          confirmButtonVariant="destructive"
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

export default PetitionDetail;