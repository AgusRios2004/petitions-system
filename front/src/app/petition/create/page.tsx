'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// Servicios y contexto
import { createPetition } from '@/service/petitionService';
import { uploadAttachment } from '@/service/attachmentService';
import { getProfessions } from '@/service/professionsService';
import { getTypePetitions } from '@/service/typePetitionsService';
import { getTypeProviders } from '@/service/typeProviderService';
import { useAuth } from '@/context/AuthContext';

// Tipos y componentes
import { Button } from '@/components/ui/Button';
import { TypePetition, TypeProvider, Profession, ApiResponse } from '@/types/common';

// Esquema de validación para el formulario principal
const petitionSchema = z
  .object({
    description: z
      .string({ message: 'La descripción es obligatoria.' })
      .min(20, { message: 'La descripción debe tener al menos 20 caracteres.' })
      .max(1000, { message: 'La descripción no puede superar los 1000 caracteres.' }),
    id_type_petition: z
      .string({ message: 'Debes seleccionar un tipo de petición.' })
      .min(1, { message: 'Debes seleccionar un tipo de petición.' }),
    id_type_provider: z.string().optional(),
    id_profession: z.string().optional(),
    date_since: z
      .string({ message: 'La fecha de inicio es obligatoria.' })
      .min(1, { message: 'La fecha de inicio es obligatoria.' }),
    date_until: z
      .string({ message: 'La fecha de fin es obligatoria.' })
      .min(1, { message: 'La fecha de fin es obligatoria.' }),
  })
  .refine(
    (data) => {
      const dateSince = new Date(data.date_since);
      const dateUntil = new Date(data.date_until);
      return dateUntil >= dateSince;
    },
    {
      message: "La fecha 'Hasta' no puede ser anterior a la fecha 'Desde'.",
      path: ['date_until'],
    }
  );

type PetitionFormValues = z.infer<typeof petitionSchema>;

export default function CreatePetitionPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Carga de datos usando useQuery
  const { data: typePetitions, isLoading: isLoadingTypePetitions } = useQuery<ApiResponse<TypePetition[]>>({ // Aquí se aplica el tipo
    queryKey: ['typePetitions'],
    queryFn: getTypePetitions,
  });

  const { data: typeProviders, isLoading: isLoadingTypeProviders } = useQuery<ApiResponse<TypeProvider[]>>({ // Y aquí
    queryKey: ['typeProviders'],
    queryFn: getTypeProviders,
  });

  const { data: professions, isLoading: isLoadingProfessions } = useQuery<ApiResponse<Profession[]>>({ // Y finalmente aquí
    queryKey: ['professions'],
    queryFn: getProfessions,
  });

  // Determinar si alguno de los datos está cargando
  const isAnyDataLoading = isLoadingTypePetitions || isLoadingTypeProviders || isLoadingProfessions;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<PetitionFormValues>({
    resolver: zodResolver(petitionSchema),
    defaultValues: {
      description: '',
      id_type_petition: '',
      id_type_provider: '',
      id_profession: '',
      date_since: '',
      date_until: '',
    },
  });

  // Estados para el adjunto
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState('');

  // Handlers para el adjunto
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAttachmentFile(event.target.files[0]);
    } else {
      setAttachmentFile(null);
    }
  };

  // Lógica de envío del formulario
  const onSubmit: SubmitHandler<PetitionFormValues> = async (data) => {
    if (!user?.customer?.id_customer) {
      toast.error('No se pudo identificar al cliente. Inicie sesión nuevamente.');
      return;
    }

    if (attachmentFile && !attachmentName.trim()) {
      toast.error('Si subes un archivo, debes darle un título al adjunto.');
      return;
    }

    const toNumber = (value: string | undefined): number | undefined => {
      if (!value || value === '' || value === '0') return undefined;
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    };

    const id_type_petition = toNumber(data.id_type_petition);
    if (!id_type_petition) {
      toast.error('Debes seleccionar un tipo de petición válido.');
      return;
    }

    const dataToSend = {
      description: data.description,
      date_since: data.date_since,
      date_until: data.date_until,
      id_customer: user.customer.id_customer,
      id_state: 3,
      id_type_petition: id_type_petition,
      id_type_provider: toNumber(data.id_type_provider),
      id_profession: toNumber(data.id_profession),
    };

    try {
      const newPetition = await toast.promise(createPetition(dataToSend), {
        loading: 'Creando petición...',
        success: '¡Petición creada con éxito!',
        error: (err) => err.response?.data?.message || 'Error al crear la petición.',
      });

      // Si hay un archivo, subirlo después de crear la petición
      if (attachmentFile && newPetition?.data?.id_petition) {
        await toast.promise(
          uploadAttachment(newPetition.data.id_petition, attachmentFile, attachmentName),
          {
            loading: 'Subiendo adjunto...',
            success: '¡Adjunto subido con éxito!',
            error: (err) => err.response?.data?.message || 'Error al subir el adjunto.',
          }
        );
      }

      reset();
      setAttachmentFile(null);
      setAttachmentName('');
      router.push('/profile');
    } catch (err) {
      console.error('Error en el proceso de creación:', err);
      // El toast ya muestra el error específico, no es necesario otro toast aquí.
    }
  };

  const handleBackClick = () => {
    if (isDirty) {
      if (window.confirm('Tiene cambios sin guardar. ¿Está seguro de que desea volver? Perderá los cambios.')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  console.log(typePetitions, typeProviders, professions);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Crear Nueva Petición</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 shadow-md rounded-lg">

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Describe detalladamente qué necesitas..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Selects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="id_type_petition" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Petición
            </label>
            <select
              id="id_type_petition"
              {...register('id_type_petition')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isAnyDataLoading} // Deshabilitar mientras carga
            >
              <option value="">Selecciona un tipo...</option>
              {typePetitions?.data?.map((tp) => (
                <option key={tp.id_type_petition} value={tp.id_type_petition}>
                  {tp.name}
                </option>
              ))}
            </select>
            {errors.id_type_petition && <p className="mt-1 text-sm text-red-600">{errors.id_type_petition.message}</p>}
          </div>

          <div>
            <label htmlFor="id_type_provider" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Proveedor (Opcional)
            </label>
            <select
              id="id_type_provider"
              {...register('id_type_provider')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isAnyDataLoading} // Deshabilitar mientras carga
            >
              <option value="">Selecciona si aplica...</option>
              {typeProviders?.data?.map((tp) => (
                <option key={tp.id_type_provider} value={tp.id_type_provider}>
                  {tp.name}
                </option>
              ))}
            </select>
            {errors.id_type_provider && (
              <p className="mt-1 text-sm text-red-600">{errors.id_type_provider.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="id_profession" className="block text-sm font-medium text-gray-700 mb-1">
              Profesión (Opcional)
            </label>
            <select
              id="id_profession"
              {...register('id_profession')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isAnyDataLoading} // Deshabilitar mientras carga
            >
              <option value="">Selecciona si aplica...</option>
              {professions?.data?.map((p) => (
                <option key={p.id_profession} value={p.id_profession}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.id_profession && <p className="mt-1 text-sm text-red-600">{errors.id_profession.message}</p>}
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date_since" className="block text-sm font-medium text-gray-700 mb-1">
              Disponible Desde
            </label>
            <input
              id="date_since"
              type="date"
              {...register('date_since')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isAnyDataLoading} // Deshabilitar mientras carga
            />
            {errors.date_since && <p className="mt-1 text-sm text-red-600">{errors.date_since.message}</p>}
          </div>

          <div>
            <label htmlFor="date_until" className="block text-sm font-medium text-gray-700 mb-1">
              Disponible Hasta
            </label>
            <input
              id="date_until"
              type="date"
              {...register('date_until')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isAnyDataLoading} // Deshabilitar mientras carga
            />
            {errors.date_until && <p className="mt-1 text-sm text-red-600">{errors.date_until.message}</p>}
          </div>
        </div>

        {/* Sección para Adjuntos */}
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900">Adjuntar Archivo (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="attachmentName" className="block text-sm font-medium text-gray-700 mb-1">
                        Título del Adjunto
                    </label>
                    <input
                        id="attachmentName"
                        type="text"
                        value={attachmentName}
                        onChange={(e) => setAttachmentName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Ej: Planos de la casa"
                        disabled={isAnyDataLoading} // Deshabilitar mientras carga
                    />
                </div>
                <div>
                    <label htmlFor="attachmentFile" className="block text-sm font-medium text-gray-700 mb-1">
                        Seleccionar Archivo
                    </label>
                    <input
                        id="attachmentFile"
                        type="file"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={isAnyDataLoading} // Deshabilitar mientras carga
                    />
                </div>
            </div>
        </div>
        <Button type="submit" disabled={isSubmitting || isAnyDataLoading}>
          {isSubmitting || isAnyDataLoading ? 'Procesando...' : 'Crear Petición'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleBackClick} disabled={isSubmitting}>
          Volver
        </Button>
      </form>
    </div>
  );
}
