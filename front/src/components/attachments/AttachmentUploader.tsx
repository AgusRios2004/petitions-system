'use client';

import React, { useState } from 'react';
import { uploadAttachment } from '@/service/attachmentService';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/Button';

interface AttachmentUploaderProps {
  petitionId: number;
  onUploadSuccess?: (result: unknown) => void; // Callback opcional para notificar al padre
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({ petitionId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState(''); // Estado para el título del adjunto
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      if (!name) {
        // Auto-rellena el nombre si está vacío
        setName(event.target.files[0].name);
      }
      setError('');
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo.');
      return;
    }
    if (!name.trim()) {
      setError('Por favor, introduce un título para el adjunto.');
      return;
    }
    if (!petitionId) {
      setError('Error: No se ha proporcionado un ID de petición.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const result = await uploadAttachment(petitionId, selectedFile, name);
      toast.success('¡Archivo subido con éxito!');

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Limpiar campos después de subir
      setSelectedFile(null);
      setName('');
      // Resetear el input de archivo
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: unknown) {
      console.error('Error al subir el archivo:', err);
      const e = err as { response?: { data?: { message?: string } } };
      const errorMessage = e.response?.data?.message || 'Hubo un problema al subir el archivo.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Título del adjunto"
        disabled={isUploading}
        className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div>
        <label htmlFor="file-upload" className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg inline-block">
          Seleccionar Archivo
        </label>
        <input id="file-upload" type="file" onChange={handleFileChange} disabled={isUploading} className="hidden" />
        {selectedFile && <span className="ml-4 text-gray-400">{selectedFile.name}</span>}
      </div>

      <Button onClick={handleUpload} disabled={isUploading || !selectedFile || !name.trim()} fullWidth={true}>
        {isUploading ? 'Subiendo...' : 'Añadir Adjunto'}
      </Button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default AttachmentUploader;