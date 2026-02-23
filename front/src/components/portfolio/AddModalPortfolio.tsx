import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioService } from '@/service/portfolioService';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

interface AddPortfolioModalProps {
  onClose: () => void;
  providerId: number;
}

export default function AddPortfolioModal({ onClose, providerId }: AddPortfolioModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: portfolioService.createPortfolio,
    onSuccess: (response) => {
      if (response.error) {
        setError(response.error);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['providerPublicProfile', providerId] });
      toast.success('Portfolio agregado con éxito!');
      onClose();
    },
    onError: (error: any) => {
      console.error(error);
      setError('Error al subir el portfolio. Intentelo nuevamente');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Debes seleccionar una imagen o un PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', file);
    formData.append('providerId', providerId.toString());

    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900/50">
          <h3 className="text-xl font-bold text-white">Agregar Proyecto</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Título del Proyecto"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Reforma de Cocina"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
            <Textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del trabajo realizado..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Archivo de Evidencia</label>
            <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 hover:border-cyan-500 transition-colors group text-center cursor-pointer">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <FiUploadCloud className="text-gray-400 group-hover:text-cyan-400 transition-colors" size={32} />
                <span className="mt-2 text-sm text-gray-400 group-hover:text-white">
                  {file ? file.name : 'Haz clic para subir una imagen o PDF'}
                </span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 !bg-cyan-600 !hover:bg-cyan-700 text-white font-bold"
            >
              {mutation.isPending ? 'Subiendo...' : 'Guardar Proyecto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}