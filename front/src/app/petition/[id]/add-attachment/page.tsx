'use client';

import { useParams, useRouter } from 'next/navigation';
import AttachmentUploader from '@/components/attachments/AttachmentUploader';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAttachment } from '@/service/attachmentService';
import { getPetitionById } from '@/service/petitionService';
import toast from 'react-hot-toast';

interface IAttachmentItem {
  id_attachment: number;
  path: string;
  name: string;
}

export default function ManageAttachmentsPage() {
  const params = useParams();
  const router = useRouter();
  const petitionId = Number(params.id);
  const queryClient = useQueryClient();

  const { data: petitionResponse, isLoading, isError } = useQuery({
    queryKey: ['petition', petitionId],
    queryFn: () => getPetitionById(petitionId),
    enabled: !!petitionId,
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: number) => deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petition', petitionId] });
      toast.success('Adjunto eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting attachment:', error);
      toast.error('Error al eliminar el adjunto');
    },
  });

  const handleUploadSuccess = () => {
    console.log('Adjunto subido con éxito en la página.');
    // Invalida la query para refrescar la lista de adjuntos
    queryClient.invalidateQueries({ queryKey: ['petition', petitionId] });
  };

  const handleFinalize = () => {
    router.push(`/petition/${petitionId}`); // Navegar de vuelta a los detalles
  };

  const handleDelete = (attachmentId: number) => {
    // Corregido: window.confirm es una función
    if (window.confirm('¿Estás seguro de que deseas eliminar este adjunto?')) {
      deleteMutation.mutate(attachmentId);
    }
  }

  if (isLoading) return <div className="text-center p-10">Cargando...</div>;
  if (isError) return <div className="text-center p-10 text-red-500">Error al cargar la petición.</div>;

  const attachments = petitionResponse?.data?.attachments || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-white">Gestionar Adjuntos</h1>
        <p className="text-gray-400 mb-8">
          Aquí puedes ver, añadir o eliminar los archivos asociados a tu petición.
        </p>

        {/* --- Sección de Adjuntos Actuales --- */}
        <div className="bg-gray-800 border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Adjuntos Actuales</h2>
          {attachments.length > 0 ? (
            <ul className="space-y-3">
              {attachments.map((attachment: IAttachmentItem) => (
                <li key={attachment.id_attachment} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                  <a href={`http://localhost:3000/${attachment.path}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate pr-4">
                    {attachment.name}
                  </a>
                  <Button
                    onClick={() => handleDelete(attachment.id_attachment)}
                    variant="secondary"
                    size="sm"
                    disabled={deleteMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay adjuntos en esta petición.</p>
          )}
        </div>

        {/* --- Sección para Añadir Nuevos Adjuntos --- */}
        <div className="bg-gray-800 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Añadir Nuevo Adjunto</h2>
          <AttachmentUploader petitionId={petitionId} onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="mt-8 text-center">
          <Button onClick={handleFinalize} variant="primary">
            Volver a la Petición
          </Button>
        </div>
      </div>
    </div>
  );
}
