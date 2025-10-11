'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Servicios y contexto
import { createPetition } from '@/service/petitionService';
import { getProfessions } from '@/service/professionsService';
import { getTypePetitions } from '@/service/typePetitionsService';
import { getTypeProviders } from '@/service/typeProviderService';
import { useAuth } from '@/context/AuthContext';

// Tipos y componentes
import { Profession, TypePetition, TypeProvider } from '@/WebApiResponse/api';
import { Button } from '@/components/ui/Button';

// ✅ Esquema de validación - trabajamos con strings y transformamos después
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

  const [typePetitions, setTypePetitions] = useState<TypePetition[]>([]);
  const [typeProviders, setTypeProviders] = useState<TypeProvider[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  // Carga de datos inicial
  useEffect(() => {
    async function fetchData() {
      try {
        const [petitionsRes, providersRes, professionsRes] = await Promise.all([
          getTypePetitions(),
          getTypeProviders(),
          getProfessions(),
        ]);

        setTypePetitions(
          Array.isArray(petitionsRes?.data) ? petitionsRes.data : Array.isArray(petitionsRes) ? petitionsRes : []
        );
        setTypeProviders(
          Array.isArray(providersRes?.data) ? providersRes.data : Array.isArray(providersRes) ? providersRes : []
        );
        setProfessions(
          Array.isArray(professionsRes?.data) ? professionsRes.data : Array.isArray(professionsRes) ? professionsRes : []
        );
      } catch (error) {
        toast.error('Error al cargar los datos para el formulario.');
        console.error('Fetch data error:', error);
      }
    }
    fetchData();
  }, []);

  // ✅ Submit del formulario - transformamos strings a números aquí
  const onSubmit: SubmitHandler<PetitionFormValues> = async (data) => {
    console.log('Raw form data:', data);

    if (!user?.customer?.id_customer) {
      toast.error('No se pudo identificar al cliente. Inicie sesión nuevamente.');
      return;
    }

    // Helper para convertir string a número o undefined
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

    console.log('Data to send:', dataToSend);

    try {
      await toast.promise(createPetition(dataToSend), {
        loading: 'Creando petición...',
        success: '¡Petición creada con éxito!',
        error: (err) => {
          const msg = err.response?.data?.message || 'Error al crear la petición.';
          console.error('Error:', msg, err);
          return msg;
        },
      });

      reset();
      router.push('/profile');
    } catch (err) {
      console.error('Error en el submit:', err);
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
            >
              <option value="">Selecciona un tipo...</option>
              {typePetitions.map((tp) => (
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
            >
              <option value="">Selecciona si aplica...</option>
              {typeProviders.map((tp) => (
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
            >
              <option value="">Selecciona si aplica...</option>
              {professions.map((p) => (
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
            />
            {errors.date_until && <p className="mt-1 text-sm text-red-600">{errors.date_until.message}</p>}
          </div>
        </div>

        {/* Botón */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando Petición...' : 'Crear Petición'}
        </Button>
      </form>
    </div>
  );
}