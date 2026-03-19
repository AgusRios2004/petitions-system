'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Servicios y contexto
import { createPetition } from '@/service/petitionService';
import { uploadAttachment } from '@/service/attachmentService';
import { getProfessions } from '@/service/professionsService';
import { getTypePetitions } from '@/service/typePetitionsService';
import { getTypeProviders } from '@/service/typeProviderService';
import { categoryService } from '@/service/categoryService';
import { useAuth } from '@/context/AuthContext';

// Tipos y componentes
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TypePetition, TypeProvider, Profession, ApiResponse, ICategory } from '@/types/common';

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
    categoryIds: z
      .array(z.string())
      .optional(), // O .min(1, "Selecciona al menos una categoría") si es obligatorio
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
  const queryClient = useQueryClient();

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

  const { data: categories, isLoading: isLoadingCategories } = useQuery<ICategory[]>({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  });

  // Determinar si alguno de los datos está cargando
  const isAnyDataLoading = isLoadingTypePetitions || isLoadingTypeProviders || isLoadingProfessions || isLoadingCategories;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setValue,
    watch,
    getValues,
    control,
  } = useForm<PetitionFormValues>({
    resolver: zodResolver(petitionSchema),
    defaultValues: {
      description: '',
      id_type_petition: '',
      id_type_provider: '',
      id_profession: '',
      date_since: '',
      date_until: '',
      categoryIds: [],
    },
  });

  // Observamos las categorías seleccionadas para renderizarlas
  const selectedCategoryIds = watch('categoryIds') || [];

  // Funciones para manejar la selección manual con el componente Select
  const handleAddCategory = (value: string | number | null) => {
    if (!value) return;
    const stringValue = String(value);
    const currentIds = getValues('categoryIds') || [];
    if (!currentIds.includes(stringValue)) {
      setValue('categoryIds', [...currentIds, stringValue], { shouldValidate: true });
    }
  };

  const handleRemoveCategory = (idToRemove: string) => {
    const currentIds = getValues('categoryIds') || [];
    setValue('categoryIds', currentIds.filter((id) => id !== idToRemove), { shouldValidate: true });
  };

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

    // Convertir el array de strings (del select multiple) a números
    const selectedCategoryIds = data.categoryIds?.map((id) => Number(id)).filter((n) => !isNaN(n)) || [];

    const dataToSend = {
      description: data.description,
      date_since: data.date_since,
      date_until: data.date_until,
      id_customer: user.customer.id_customer,
      id_state: 3,
      id_type_petition: id_type_petition,
      id_type_provider: toNumber(data.id_type_provider),
      id_profession: toNumber(data.id_profession),
      categoryIds: selectedCategoryIds, // Enviamos el array de IDs
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

      await queryClient.invalidateQueries({ queryKey: ['customerProfile', user.customer.id_customer] });
      await queryClient.invalidateQueries({ queryKey: ['petitions'] });

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
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-white">Crear Nueva Petición</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-800 p-8 shadow-lg rounded-lg border border-gray-700">

          {/* Descripción */}
          <div>
            <Label htmlFor="description" className="text-gray-300 mb-2 block">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={5}
              placeholder="Describe detalladamente qué necesitas..."
              variant="dark"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Controller
                name="id_type_petition"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Tipo de Petición"
                    id="id_type_petition"
                    options={typePetitions?.data?.map((tp) => ({ value: String(tp.id_type_petition), label: tp.name })) || []}
                    value={field.value}
                    onChange={(val) => field.onChange(val ?? '')}
                    error={errors.id_type_petition?.message}
                    disabled={isAnyDataLoading}
                    placeholder="Selecciona"
                    variant="dark"
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="id_type_provider"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Tipo de Proveedor (Opcional)"
                    id="id_type_provider"
                    options={typeProviders?.data?.map((tp) => ({ value: String(tp.id_type_provider), label: tp.name })) || []}
                    value={field.value}
                    onChange={(val) => field.onChange(val ?? '')}
                    error={errors.id_type_provider?.message}
                    disabled={isAnyDataLoading}
                    placeholder="Selecciona"
                    variant="dark"
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="id_profession"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Profesión (Opcional)"
                    id="id_profession"
                    options={professions?.data?.map((p) => ({ value: String(p.id_profession), label: p.name })) || []}
                    value={field.value}
                    onChange={(val) => field.onChange(val ?? '')}
                    error={errors.id_profession?.message}
                    disabled={isAnyDataLoading}
                    placeholder="Selecciona..."
                    variant="dark"
                  />
                )}
              />
            </div>
          </div>

          {/* Categorías (Combobox con lista de tags) */}
          <div>
            <Select
              label="Categorías de Interés"
              id="categories-select"
              options={categories?.map((c) => ({ value: c.id_category, label: c.name })) || []}
              onChange={handleAddCategory}
              value={null} // Siempre null para que funcione como un "agregador" y se limpie tras seleccionar
              placeholder="Selecciona una categoría para agregar..."
              disabled={isAnyDataLoading}
              variant="dark"
            />

            {/* Lista visual de categorías seleccionadas */}
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCategoryIds.map((id) => {
                const category = categories?.find((c) => String(c.id_category) === id);
                return (
                  <span key={id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-100 border border-blue-700">
                    {category?.name || 'Cargando...'}
                    <button type="button" onClick={() => handleRemoveCategory(id)} className="ml-2 text-blue-300 hover:text-white font-bold focus:outline-none">
                      &times;
                    </button>
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">Selecciona las categorías que mejor describan tu petición para notificar a los proveedores adecuados.</p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Disponible Desde"
                id="date_since"
                type="date"
                {...register('date_since')}
                error={errors.date_since?.message}
                disabled={isAnyDataLoading} // Deshabilitar mientras carga
              />
            </div>

            <div>
              <Input
                label="Disponible Hasta"
                id="date_until"
                type="date"
                {...register('date_until')}
                error={errors.date_until?.message}
                disabled={isAnyDataLoading} // Deshabilitar mientras carga
              />
            </div>
          </div>

          {/* Sección para Adjuntos */}
          <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
            <h3 className="text-lg font-medium text-gray-200">Adjuntar Archivo (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Título del Adjunto"
                  id="attachmentName"
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="Ej: Planos de la casa"
                  disabled={isAnyDataLoading} // Deshabilitar mientras carga
                />
              </div>
              <div>
                <Label htmlFor="attachmentFile" className="block text-sm font-medium text-gray-300 mb-1">
                  Seleccionar Archivo
                </Label>
                <input
                  id="attachmentFile"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-blue-400 hover:file:bg-gray-600"
                  disabled={isAnyDataLoading} // Deshabilitar mientras carga
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-gray-700/50">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBackClick}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all border border-white/5 shadow-xl shadow-black/20"
            >
              Volver Atrás
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || isAnyDataLoading}
              className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-900/40 border-none transition-all hover:scale-[1.02]"
            >
              {isSubmitting || isAnyDataLoading ? 'Procesando...' : 'Publicar Petición'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
