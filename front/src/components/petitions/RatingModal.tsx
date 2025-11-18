'use client';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StarRating from '@/components/ui/StarRating';
import { gradeService } from '@/service/gradeService';
import toast from 'react-hot-toast';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: number;
  petitionId: number;
  customerId: number;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, providerId, customerId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: gradeService.createGrade,
    onSuccess: () => {
      toast.success('Calificación enviada con éxito');
      queryClient.invalidateQueries({ queryKey: ['petitions', customerId] });
      onClose();
    },
    onError: (error) => {
      const errorMessage = error || 'Error al enviar la calificación';
      toast.error(`Error al enviar la calificación: ${errorMessage}`);
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
    } else if (rating === 3){
      colorId = 3;
    } else if (rating === 4){
      colorId = 31;
    } else {
      colorId = 28;
    }

    mutate({
      id_provider: providerId,
      id_customer: customerId,
      grade_number: rating,
      id_color: colorId,
      comment,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calificar al Proveedor">
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Tu Calificación</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
              Comentario (Opcional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe tu experiencia con el proveedor..."
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
