'use client';

import { useParams, useRouter } from 'next/navigation';
import AttachmentUploader from '@/components/attachments/AttachmentUploader';
import { Button } from '@/components/ui/Button';

export default function AddAttachmentPage() {
  const params = useParams();
  const router = useRouter();
  const petitionId = Number(params.id);

  const handleUploadSuccess = () => {
    // Opcional: Muestra una alerta o notificación de éxito
    console.log('Adjunto subido con éxito en la página.');
  };

  const handleFinalize = () => {
    // Navegar a la página de detalles de la petición o a la lista de peticiones
    router.push('/petition'); // O, por ejemplo, `/petition/${petitionId}`
  };

  if (!petitionId) {
    return <div>Cargando o ID de petición inválido...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Paso 2: Añadir Adjuntos</h1>
        <p className="text-gray-600 mb-6">
          Tu petición ha sido creada. Ahora puedes añadir los archivos que consideres necesarios.
          Puedes añadir varios, uno por uno.
        </p>

        <div className="bg-white p-8 shadow-md rounded-lg">
          <AttachmentUploader petitionId={petitionId} onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="mt-8 text-center">
          <Button onClick={handleFinalize} variant="secondary">
            Finalizar y Ver Mis Peticiones
          </Button>
        </div>
      </div>
    </div>
  );
}
