import React, { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelPetition } from '@/service/petitionService';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { SOCKET_URL } from '@/service/socketService';
import {
  FiArrowLeft, FiEdit3, FiXCircle, FiPlay, FiCheckCircle,
  FiClock, FiCalendar, FiUser, FiPhone, FiTag, FiPaperclip,
  FiInfo, FiArrowRight
} from 'react-icons/fi';

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
  const stateCode = petition.states?.code;

  const getStatusConfig = (code: string | undefined) => {
    switch (code) {
      case 'PEN': return { color: 'amber', icon: <FiClock />, text: 'Esperando propuestas' };
      case 'ACE': return { color: 'green', icon: <FiPlay />, text: 'Trabajo en progreso' };
      case 'FIN': return { color: 'blue', icon: <FiCheckCircle />, text: 'Trabajo finalizado' };
      case 'CAN': return { color: 'red', icon: <FiXCircle />, text: 'Petición anulada' };
      default: return { color: 'gray', icon: <FiInfo />, text: 'Estado desconocido' };
    }
  };

  const statusConfig = getStatusConfig(stateCode);

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
    <div className="min-h-screen bg-transparent py-6 sm:py-12">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Banner de Estado Superior */}
        <div className={`mb-8 p-4 rounded-2xl bg-${statusConfig.color}-500/10 border border-${statusConfig.color}-500/20 flex items-center justify-between animate-in slide-in-from-top-4 duration-500`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${statusConfig.color}-500/20 flex items-center justify-center text-${statusConfig.color}-400 text-xl`}>
              {statusConfig.icon}
            </div>
            <div>
              <p className={`text-${statusConfig.color}-400 text-xs font-black uppercase tracking-widest`}>Estado Actual</p>
              <h4 className="text-white font-bold">{petition.states?.state} — <span className="font-normal opacity-70">{statusConfig.text}</span></h4>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 pr-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${['PEN', 'ACE', 'FIN'].includes(stateCode || '') ? 'bg-blue-500 border-blue-500' : 'border-gray-700'} `} />
              <span className="text-[10px] text-gray-500 font-bold mt-1">Solicitado</span>
            </div>
            <div className="w-12 h-px bg-gray-800" />
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${['ACE', 'FIN'].includes(stateCode || '') ? 'bg-green-500 border-green-500' : 'border-gray-700'} `} />
              <span className="text-[10px] text-gray-500 font-bold mt-1">Aceptado</span>
            </div>
            <div className="w-12 h-px bg-gray-800" />
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${'FIN' === stateCode ? 'bg-purple-500 border-purple-500' : 'border-gray-700'} `} />
              <span className="text-[10px] text-gray-500 font-bold mt-1">Completado</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Columna Principal - Info del Proyecto */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 sm:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-10 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

              <header className="relative z-10 space-y-6 mb-12">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-widest transition-colors mb-2">
                    {petition.typePetitions?.name}
                  </span>
                  <div className="flex items-center gap-2 bg-blue-600/10 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest mb-2">
                    <FiPlay className="animate-pulse" /> Publicado el {new Date(petition.date_create).toLocaleDateString()}
                  </div>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.1] tracking-tight uppercase break-words">
                  {petition.profession?.name || petition.typePetitions?.name || 'Servicio Requerido'}
                </h1>
              </header>

              <section className="relative z-10">
                <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <FiArrowRight /> Descripción
                </h2>
                <div className="p-8 bg-black/30 rounded-3xl border border-white/5 leading-relaxed text-gray-300 text-lg shadow-inner-white font-medium">
                  {petition.description}
                </div>
              </section>

              {/* Botones de Navegación Inteligente */}
              <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-4 relative z-10">
                <div className="flex bg-gray-900 px-2 py-2 rounded-2xl border border-white/5 gap-2">
                  <Button
                    onClick={() => router.back()}
                    variant="secondary"
                    className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-[10px] uppercase tracking-widest border-none"
                  >
                    <FiArrowLeft /> Volver
                  </Button>
                  <Button
                    onClick={() => router.push('/profile')}
                    variant="ghost"
                    className="flex items-center gap-2 h-10 px-4 rounded-xl text-gray-400 hover:text-white font-bold transition-all text-[10px] uppercase tracking-widest"
                  >
                    Dashboard
                  </Button>
                </div>

                <div className="flex-1" />

                {isOwner && (
                  <div className="flex gap-2">
                    {stateCode !== 'ACE' && stateCode !== 'FIN' && stateCode !== 'CAN' && (
                      <>
                        <Button onClick={() => onEdit(petition.id_petition)} className="flex items-center gap-2 h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all shadow-xl shadow-blue-900/40 text-xs uppercase tracking-widest border-none">
                          <FiEdit3 /> Editar Petición
                        </Button>
                        <Button onClick={handleCancelPetition} variant="destructive" className="flex items-center gap-2 h-14 px-6 rounded-2xl border border-red-900/20 font-black transition-all text-xs uppercase tracking-widest" disabled={cancelMutation.isPending}>
                          <FiXCircle /> {cancelMutation.isPending ? 'Anulando...' : 'Anular'}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {!isOwner && user?.provider && stateCode === 'PEN' && (
                  <Link href={`/postulation/create/${petition.id_petition}`}>
                    <Button className="flex items-center gap-2 h-14 px-10 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black transition-all shadow-xl shadow-green-900/40 text-xs uppercase tracking-widest border-none">
                      Enviar Propuesta
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Adjuntos */}
            <section className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <FiPaperclip /> Archivos Adjuntos
              </h2>
              {petition.attachments && petition.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {petition.attachments.map((file) => (
                    <a key={file.id_attachment} href={`${SOCKET_URL}/${file.path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-gray-800/30 hover:bg-gray-800/80 border border-white/5 rounded-2xl transition-all group overflow-hidden relative">
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                      <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center font-black shrink-0 transition-transform group-hover:-rotate-6">
                        DOC
                      </div>
                      <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors truncate relative z-10">{file.name}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center text-gray-500 italic flex flex-col items-center gap-2">
                  <FiXCircle className="opacity-20 text-3xl" />
                  No se han adjuntado archivos a esta petición.
                </div>
              )}
            </section>
          </div>

          {/* Columna Lateral - Detalles Técnicos */}
          <aside className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.25em] mb-8 border-b border-white/5 pb-4">Detalles Técnicos</h3>

              <div className="space-y-8">
                <DetailItem icon={<FiUser />} label="Especialista" value={petition.typeProvider?.name} color="blue" />
                <DetailItem icon={<FiCalendar />} label="Cronograma" value={`${new Date(petition.date_since).toLocaleDateString()} — ${new Date(petition.date_until).toLocaleDateString()}`} color="green" />
                <DetailItem icon={<FiPhone />} label="Contacto" value={petition.customers?.phone || 'No disponible'} color="amber" />
                <DetailItem icon={<FiInfo />} label="Registro" value={`Publicado: ${new Date(petition.date_create).toLocaleDateString()}`} color="gray" />
              </div>

              {petition.categories && petition.categories.length > 0 && (
                <div className="mt-10 pt-8 border-t border-white/5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiTag /> Etiquetas del Proyecto
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {petition.categories.map((cat) => (
                      <span key={cat.id_category} className="bg-gray-800 text-gray-300 hover:text-white text-[10px] font-bold px-4 py-2 rounded-lg border border-white/5 uppercase transition-colors">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isOwner && (
              <Button
                onClick={togglePostulations}
                className={`w-full h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all ring-offset-gray-950 ring-2 ${showPostulations ? 'bg-gray-800 text-white ring-white/10' : 'bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-950/60 ring-green-500/40 hover:scale-[1.02]'}`}
              >
                {showPostulations ? (
                  <span className="flex items-center justify-center gap-2 text-white">Ocultar Postulaciones <FiArrowLeft /></span>
                ) : (
                  <span className="flex items-center justify-center gap-2 text-white">Ver Propuestas Recibidas <FiArrowRight /></span>
                )}
              </Button>
            )}

            <div className="p-6 rounded-[2rem] bg-blue-600/5 border border-blue-500/10">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><FiInfo /> Recomendación</p>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                Recuerda verificar las calificaciones de los profesionales antes de aceptar una propuesta.
              </p>
            </div>
          </aside>
        </div>

        {/* Sección de Postulaciones Dinámica */}
        {showPostulations && (
          <div className="mt-12 animate-in slide-in-from-top-12 fade-in duration-700 fill-mode-forwards relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-green-500 to-transparent" />
            <div className="bg-gray-950/50 rounded-[3rem] border border-green-500/20 p-2 sm:p-6 overflow-hidden">
              <PetitionPostulations petitionId={petition.id_petition} />
            </div>
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

function DetailItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    gray: 'text-gray-400 bg-gray-500/10',
  };

  return (
    <div className="flex items-start gap-5 group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-110 ${colors[color] || colors.gray}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</span>
        <span className="text-sm font-bold text-white break-words">{value}</span>
      </div>
    </div>
  );
}

export default PetitionDetail;