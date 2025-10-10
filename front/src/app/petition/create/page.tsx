'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { createPetition } from '@/service/petitionService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// --- Validation Schema --- //
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

const petitionSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres.').max(100, 'El título no puede exceder los 100 caracteres.'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres.').max(1000, 'La descripción no puede exceder los 1000 caracteres.'),
  attachment: z
    .any()
    .refine((files) => files?.length == 1, 'Debes adjuntar un archivo.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `El tamaño máximo es 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Formatos permitidos: .jpg, .jpeg, .png, .webp y .pdf'
    ),
});

type PetitionFormValues = z.infer<typeof petitionSchema>;

// --- Component --- //
export default function CreatePetitionPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PetitionFormValues>({
    resolver: zodResolver(petitionSchema),
  });

  const onSubmit: SubmitHandler<PetitionFormValues> = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('attachment', data.attachment[0]);

    const promise = createPetition(formData);

    toast.promise(promise, {
      loading: 'Creando petición...',
      success: '¡Petición creada con éxito!',
      error: 'Hubo un error al crear la petición.',
    });

    try {
      await promise;
      reset(); // Reset form fields on success
    } catch (error) {
      // Error is already handled by toast.promise
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Crear Nueva Petición</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 shadow-md rounded-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <Input id="title" type="text" {...register('title')} placeholder="Ej: Necesito un plomero urgente" />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="description"
            {...register('description')}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe detalladamente qué necesitas..."
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">Archivo Adjunto</label>
          <Input id="attachment" type="file" {...register('attachment')} />
          <p className="mt-1 text-sm text-gray-500">PDF o Imagen (JPG, PNG, WEBP). Máx 5MB.</p>
          {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment.message as string}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Petición'}
        </Button>
      </form>
    </div>
  );
}
