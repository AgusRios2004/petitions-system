'use client';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StarRating from '@/components/ui/StarRating';
import { gradeService } from '@/service/gradeService';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { IGradeForm } from '@/types/common';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: number;
  customerId: number;
  ratingTarget: 'provider' | 'customer';
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, providerId, customerId, ratingTarget }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: gradeService.createGrade,
    onSuccess: () => {
      toast.success('Calificación enviada con éxito.');
      // Invalida las postulaciones para refrescar la vista y posiblemente ocultar el botón de calificar.
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
      onClose();
    },
    onError: (error: unknown) => {
      // Captura el mensaje de error específico del backend.
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Ocurrió un error al enviar la calificación.';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Por favor, selecciona una calificación');
      return;
    }

    let colorId;
    if (rating == 1) {
      colorId = 1;
    } else if (rating === 2) {
      colorId = 2;
    } else if (rating === 3) {
      colorId = 3;
    } else if (rating === 4) {
      colorId = 31;
    } else {
      colorId = 28;
    }

    // Construimos el payload dinámicamente según a quién se califica.
    const payload: Record<string, unknown> = {
      grade_number: rating,
      id_color: colorId,
      comment,
    };

    if (ratingTarget === 'provider') {
      // Cliente califica a Proveedor: Se necesita el ID del proveedor calificado y el del cliente autor.
      payload.id_provider = providerId;
    } else {
      // Proveedor califica a Cliente: Se necesita solo el ID del cliente calificado.
      payload.id_customer = customerId;
    }

    mutate(payload as unknown as IGradeForm);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Calificar al ${ratingTarget === 'provider' ? 'Proveedor' : 'Cliente'}`}>
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Tu Calificación</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2 ">
              Comentario (Opcional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={`Describe tu experiencia con el ${ratingTarget === 'provider' ? 'proveedor' : 'cliente'}...`}
            />
          </div>
        </div>
        <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <Button type="submit" disabled={isPending} fullWidth={false}>
            {isPending ? 'Enviando...' : 'Enviar Calificación'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="mr-2" fullWidth={false}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RatingModal;
