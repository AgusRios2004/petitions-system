'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { offerService } from '@/service/offerService';
import { typeOfferService } from '@/service/typeOfferService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/Select';
import { IOffer } from '@/types/common';

const offerSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  id_type_offer: z.number().min(1, 'Selecciona un tipo de oferta'),
  date_open: z.string().optional(),
  date_close: z.string().optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface ProviderOffersProps {
  providerId: number;
}

const ProviderOffers: React.FC<ProviderOffersProps> = ({ providerId }) => {
  const queryClient = useQueryClient();

  // --- Queries ---
  const { data: offersData, isLoading: isLoadingOffers } = useQuery({
    queryKey: ['providerOffers', providerId],
    queryFn: () => offerService.getOffersByProvider(providerId),
  });

  const { data: typeOffersData } = useQuery({
    queryKey: ['typeOffers'],
    queryFn: typeOfferService.getAllTypeOffers,
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (data: OfferFormValues) => offerService.createOffer({ ...data, id_provider: providerId }),
    onSuccess: () => {
      toast.success('Oferta creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['providerOffers', providerId] });
      reset();
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Error al crear la oferta');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: offerService.deleteOffer,
    onSuccess: () => {
      toast.success('Oferta eliminada');
      queryClient.invalidateQueries({ queryKey: ['providerOffers', providerId] });
    },
    onError: () => toast.error('Error al eliminar la oferta'),
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      description: '',
      id_type_offer: 0,
      date_open: '',
      date_close: '',
    }
  });

  const onSubmit = (data: OfferFormValues) => {
    createMutation.mutate(data);
  };

  const offers = offersData?.data || [];
  const typeOffers = typeOffersData?.data || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna Izquierda: Formulario de Creación */}
      <div className="lg:col-span-1 bg-gray-900/50 p-6 rounded-lg border border-gray-700 h-fit">
        <h3 className="text-xl font-bold text-white mb-4">Crear Nueva Oferta</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Título"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Ej: Mantenimiento de PC"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <Select
              label="Tipo de Oferta"
              options={typeOffers.map(t => ({ value: t.id_type_offer, label: t.name }))}
              value={watch('id_type_offer')}
              onChange={(val) => setValue('id_type_offer', Number(val), { shouldValidate: true })}
              error={errors.id_type_offer?.message}
              placeholder="Selecciona un tipo..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha Inicio"
              type="date"
              {...register('date_open')}
              className="bg-gray-800 border-gray-700 text-white [color-scheme:dark]"
            />
            <Input
              label="Fecha Fin"
              type="date"
              {...register('date_close')}
              className="bg-gray-800 border-gray-700 text-white [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
            <Textarea
              {...register('description')}
              variant="dark"
              placeholder="Describe detalladamente qué incluye tu oferta..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Publicar Oferta'}
          </Button>
        </form>
      </div>

      {/* Columna Derecha: Listado de Ofertas */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-2xl font-bold text-white mb-4">Mis Ofertas Activas</h3>

        {isLoadingOffers ? (
          <p className="text-gray-400">Cargando ofertas...</p>
        ) : offers.length === 0 ? (
          <div className="text-center py-10 bg-gray-800 rounded-lg border border-dashed border-gray-600">
            <p className="text-gray-400">No has creado ninguna oferta todavía.</p>
            <p className="text-sm text-gray-500 mt-1">Usa el formulario para publicar tu primer servicio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer: IOffer) => {
              const isExpired = offer.date_close ? new Date(offer.date_close) < new Date() : false;

              return (
                <div key={offer.offer_id} className={`bg-gray-800 p-5 rounded-lg border ${isExpired ? 'border-red-900/40 opacity-75' : 'border-gray-700 hover:border-blue-500'} transition-colors relative group`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">{offer.typeOffer?.name || 'Servicio'}</span>
                      {isExpired && <span className="bg-red-900 text-red-200 text-xs px-2 py-1 rounded-full">Expirada</span>}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{offer.name}</h4>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{offer.description}</p>
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(offer.offer_id)} disabled={deleteMutation.isPending}>
                    Eliminar
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderOffers;