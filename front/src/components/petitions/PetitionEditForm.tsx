'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getProfessions } from '@/service/professionsService';
import { getTypePetitions } from '@/service/typePetitionsService';
import { getTypeProviders } from '@/service/typeProviderService';
import { categoryService } from '@/service/categoryService';

// Helper to format date for input[type='date']
const formatDateForInput = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const day = (`0${d.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
};

// Esquema de validación (mismo que en creación)
const petitionEditSchema = z.object({
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres.").max(1000),
  id_profession: z.number().optional(),
  id_type_petition: z.number().min(1, "Selecciona un tipo de petición"),
  id_type_provider: z.number().optional(),
  date_since: z.string().min(1, "Fecha requerida"),
  date_until: z.string().min(1, "Fecha requerida"),
  categoryIds: z.array(z.number()).optional(),
}).refine((data) => {
  const start = new Date(data.date_since);
  const end = new Date(data.date_until);
  return end >= start;
}, {
  message: "La fecha 'Hasta' no puede ser anterior a 'Desde'",
  path: ["date_until"],
});

type PetitionEditFormValues = z.infer<typeof petitionEditSchema>;

interface Petition {
  id_petition: number;
  description: string;
  date_since: string;
  date_until: string;
  id_profession: number;
  id_type_petition: number;
  id_type_provider: number;
  id_customer: number;
  id_state: number;
  categories?: { id_category: number; name: string }[];
}

interface PetitionEditFormProps {
  petition: Petition;
  onSave: (formData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const PetitionEditForm: React.FC<PetitionEditFormProps> = ({ petition, onSave, onCancel, isLoading }) => {
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<PetitionEditFormValues>({
    resolver: zodResolver(petitionEditSchema),
    defaultValues: {
      description: petition.description,
      id_profession: petition.id_profession,
      id_type_petition: petition.id_type_petition,
      id_type_provider: petition.id_type_provider,
      date_since: formatDateForInput(petition.date_since),
      date_until: formatDateForInput(petition.date_until),
      categoryIds: petition.categories?.map(c => c.id_category) || [],
    }
  });

  // Queries to fetch data for select options
  const { data: professionsData } = useQuery({ queryKey: ['professions'], queryFn: getProfessions });
  const { data: typePetitionsData } = useQuery({ queryKey: ['typePetitions'], queryFn: getTypePetitions });
  const { data: typeProvidersData } = useQuery({ queryKey: ['typeProviders'], queryFn: getTypeProviders });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAllCategories });

  // Registrar manualmente el campo categoryIds para que se incluya en el handleSubmit
  useEffect(() => {
    register('categoryIds');
  }, [register]);

  // Manejo de categorías
  const selectedCategoryIds = watch('categoryIds') || [];

  const handleAddCategory = (val: string | number | null) => {
    const id = Number(val);
    if (!id) return;
    const current = watch('categoryIds') || [];
    if (!current.includes(id)) {
      setValue('categoryIds', [...current, id], { shouldValidate: true });
    }
  };

  const handleRemoveCategory = (id: number) => {
    const current = watch('categoryIds') || [];
    setValue('categoryIds', current.filter(c => c !== id), { shouldValidate: true });
  };

  const onSubmit = (data: PetitionEditFormValues) => {
    onSave({
      ...data,
      id_customer: petition.id_customer, 
      id_state: petition.id_state,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Editar Petición</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profession */}
          <div>
            <Controller
              name="id_profession"
              control={control}
              render={({ field }) => (
                <Select
                  label="Profesión"
                  options={professionsData?.data?.map(p => ({ value: p.id_profession, label: p.name })) || []}
                  value={field.value}
                  onChange={(val) => field.onChange(Number(val))}
                  variant="dark"
                  placeholder="Selecciona una profesión"
                />
              )}
            />
          </div>

          {/* Petition Type */}
          <div>
            <Controller
              name="id_type_petition"
              control={control}
              render={({ field }) => (
                <Select
                  label="Tipo de Petición"
                  options={typePetitionsData?.data?.map(t => ({ value: t.id_type_petition, label: t.name })) || []}
                  value={field.value}
                  onChange={(val) => field.onChange(Number(val))}
                  variant="dark"
                  placeholder="Selecciona un tipo"
                  error={errors.id_type_petition?.message}
                />
              )}
            />
          </div>

          {/* Provider Type */}
          <div>
            <Controller
              name="id_type_provider"
              control={control}
              render={({ field }) => (
                <Select
                  label="Tipo de Proveedor"
                  options={typeProvidersData?.data?.map(t => ({ value: t.id_type_provider, label: t.name })) || []}
                  value={field.value}
                  onChange={(val) => field.onChange(Number(val))}
                  variant="dark"
                  placeholder="Selecciona un tipo de proveedor"
                />
              )}
            />
          </div>

          {/* Date Since */}
          <div>
            <Input
              type="date"
              label="Disponible Desde"
              {...register('date_since')}
              variant="dark"
              error={errors.date_since?.message}
            />
          </div>

          {/* Date Until */}
          <div>
            <Input
              type="date"
              label="Disponible Hasta"
              {...register('date_until')}
              variant="dark"
              error={errors.date_until?.message}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <Label htmlFor="description" className="mb-1 block text-gray-300">Descripción</Label>
          <Textarea
            id="description"
            {...register('description')}
            variant="dark"
            rows={6}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Categories */}
        <div className="mt-6">
          <Select
            label="Categorías de Interés"
            options={categories?.map(c => ({ label: c.name, value: c.id_category })) || []}
            onChange={handleAddCategory}
            value={null}
            placeholder="Agregar categoría..."
            variant="dark"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCategoryIds.map(id => {
              const cat = categories?.find(c => c.id_category === id);
              return (
                <span key={id} className="bg-blue-900/40 text-blue-200 border border-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {cat?.name || 'Cargando...'}
                  <button type="button" onClick={() => handleRemoveCategory(id)} className="hover:text-white font-bold">×</button>
                </span>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button type="button" onClick={onCancel} variant="secondary" fullWidth={false} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" fullWidth={false} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PetitionEditForm;