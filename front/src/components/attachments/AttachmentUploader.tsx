'use client';

import React, { useState } from 'react';
import { uploadAttachment } from '@/service/attachmentService';

interface AttachmentUploaderProps {
  petitionId: number;
  onUploadSuccess?: (result: any) => void; // Callback opcional para notificar al padre
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({ petitionId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState(''); // Estado para el título del adjunto
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
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
      console.log('Archivo subido con éxito:', result);
      alert('¡Archivo subido con éxito!');

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Limpiar campos después de subir
      setSelectedFile(null);
      setName('');

    } catch (err: any) {
      console.error('Error al subir el archivo:', err);
      const errorMessage = err.response?.data?.message || 'Hubo un problema al subir el archivo.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Título del adjunto"
        disabled={isUploading}
      />
      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      <button onClick={handleUpload} disabled={isUploading || !selectedFile || !name.trim()}>
        {isUploading ? 'Subiendo...' : 'Añadir Adjunto'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AttachmentUploader;