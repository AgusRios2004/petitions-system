'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { providerService } from '@/service/providerService';
import { updateProviderProfile } from '@/service/profileService';
import { locationService } from '@/service/locationService';
import { getProfessions } from '@/service/professionsService';
import { getTypeProviders } from '@/service/typeProviderService';
import { ProviderProfileFormData, providerProfileSchema } from '@/types/schemas/provider.schema';
import { UpdateProviderPayload } from '@/types/common';

import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const EditProviderForm = ({ providerId }: { providerId: number }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isInitialLoad = useRef(true);

  // 1. Carga de datos principal
  const { data: providerData, isLoading: isLoadingProvider, isError } = useQuery({
    queryKey: ['providerProfile', providerId],
    queryFn: () => providerService.getProviderByIdWithDetails(providerId),
    enabled: !!providerId,
  });

  // 2. Configuración del formulario
  const { register, handleSubmit, formState: { errors }, watch, control, setValue } = useForm<ProviderProfileFormData>({
    resolver: zodResolver(providerProfileSchema),
    defaultValues: {
      name: '',
      lastname: '',
      email: '',
      street: '',
      number: '',
      floor: '',
      apartment: '',
      postal_code: '',
      id_country: 0,
      id_province: 0,
      id_departament: 0,
      id_city: 0,
      id_type_provider: 0,
      id_profession: 0,
    }
  });

  // 3. Observar IDs para selects en cascada
  const watchedCountryId = watch('id_country');
  const watchedProvinceId = watch('id_province');
  const watchedDepartmentId = watch('id_departament');

  // 4. Carga de datos para los Selects
  const { data: countries = [] } = useQuery({ queryKey: ['countries'], queryFn: locationService.getCountries });
  const { data: provinces = [], isLoading: isLoadingProvinces } = useQuery({
    queryKey: ['provinces', watchedCountryId],
    queryFn: () => locationService.getProvincesByCountry(watchedCountryId),
    enabled: !!watchedCountryId && watchedCountryId > 0,
  });
  const { data: departments, isLoading: isLoadingDepartments } = useQuery({ queryKey: ['departments', watchedProvinceId], queryFn: () => locationService.getDepartmentsByProvince(watchedProvinceId), enabled: watchedProvinceId > 0 });

  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ['cities', watchedDepartmentId],
    queryFn: () => locationService.getCitiesByDepartment(watchedDepartmentId),
    enabled: !!watchedDepartmentId && watchedDepartmentId > 0,
  });
  const { data: providerTypesResponse = { data: [], error: null } } = useQuery({
    queryKey: ['providerTypes'],
    queryFn: getTypeProviders,
  });
  const providerTypes = providerTypesResponse.data || [];

  const { data: professionsResponse = { data: [], error: null } } = useQuery({
    queryKey: ['professions'],
    queryFn: getProfessions,
  });
  const professions = professionsResponse.data || [];

  // 5. Poblar el formulario y manejar cascada
  useEffect(() => {
    if (providerData) {
      const p = providerData;
      setValue('name', p.user?.name || '');
      setValue('lastname', p.user?.lastname || '');
      setValue('email', p.user?.email || '');
      setValue('id_address', p.address?.id_address);
      setValue('street', p.address?.street || '');
      setValue('number', p.address?.number || '');
      setValue('floor', p.address?.floor || '');
      setValue('apartment', p.address?.apartment || '');
      setValue('postal_code', p.address?.postal_code || '');
      setValue('id_country', p.address?.city?.department?.province?.country?.id_country || 0);
      setValue('id_province', p.address?.city?.department?.province?.id_province || 0);
      setValue('id_departament', p.address?.city?.department?.id_department || 0);
      setValue('id_city', p.address?.city?.id_city || 0);
      setValue('id_type_provider', p.typeProvider?.id_type_provider || 0);
      setValue('id_profession', p.profession?.id_profession || 0);
      
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 500);
    }
  }, [providerData, setValue]);

  useEffect(() => {
    if (!isInitialLoad.current) {
      setValue('id_province', 0);
      setValue('id_departament', 0);
      setValue('id_city', 0);
    }
  }, [watchedCountryId, setValue]);

  useEffect(() => {
    if (!isInitialLoad.current) {
      setValue('id_departament', 0);
      setValue('id_city', 0);
    }
  }, [watchedProvinceId, setValue]);

  useEffect(() => {
    if (!isInitialLoad.current) {
      setValue('id_city', 0);
    }
  }, [watchedDepartmentId, setValue]);

  // 6. Mutación para enviar actualizaciones
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: ProviderProfileFormData) => {
      const payload: UpdateProviderPayload = {
        id_type_provider: data.id_type_provider,
        id_profession: data.id_profession,
        address: {
          id_address: data.id_address,
          street: data.street,
          number: data.number,
          floor: data.floor,
          apartment: data.apartment,
          postal_code: data.postal_code,
          id_city: data.id_city,
        }
      };
      return updateProviderProfile(providerId, payload);
    },
    onSuccess: () => {
      toast.success("Perfil actualizado con éxito!");
      queryClient.invalidateQueries({ queryKey: ['providerProfile', providerId] });
    },
    onError: (error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    }
  });

  const onSubmit = (data: ProviderProfileFormData) => updateProfile(data);

  const mapToOptions = (items: any[] = [], labelKey: string, valueKey: string): SelectOption[] =>
    items.map(item => ({ label: item[labelKey], value: item[valueKey] }));

  if (isLoadingProvider) return <p className="text-white">Cargando perfil...</p>;
  if (isError) return <p className="text-red-500">Error al cargar el perfil.</p>;

  console.log(provinces)
  console.log(departments)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Editar Perfil de Proveedor</h2>

      {/* User Info */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">Información del Usuario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input id="name" label="Nombre" type="text" {...register("name")} error={errors.name?.message} />
          <Input id="lastname" label="Apellido" type="text" {...register("lastname")} error={errors.lastname?.message} />
          <div className="md:col-span-2">
            <Input id="email" label="Correo Electrónico" type="email" {...register("email")} error={errors.email?.message} readOnly />
          </div>
        </div>
      </div>

      {/* Address Info */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">Dirección</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input id="street" label="Calle" type="text" {...register("street")} error={errors.street?.message} />
          <Input id="number" label="Número" type="text" {...register("number")} error={errors.number?.message} />
          <Input id="floor" label="Piso (Opcional)" type="text" {...register("floor")} error={errors.floor?.message} />
          <Input id="apartment" label="Apartamento (Opcional)" type="text" {...register("apartment")} error={errors.apartment?.message} />
          <Input id="postal_code" label="Código Postal" type="text" {...register("postal_code")} error={errors.postal_code?.message} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Controller name="id_country" control={control} render={({ field }) => (
            <Select 
              label="País" 
              options={mapToOptions(countries, 'name', 'id_country')} 
              onChange={(value) => field.onChange(value)} 
              value={field.value} 
            />
          )} />
          <Controller name="id_province" control={control} render={({ field }) => (
            <Select 
              label="Provincia" 
              options={mapToOptions(provinces, 'name', 'id_province')} 
              onChange={(value) => field.onChange(value)} 
              value={field.value} 
              disabled={isLoadingProvinces || !watchedCountryId} 
            />
          )} />
          <Controller name="id_departament" control={control} render={({ field }) => (
            <Select 
              label="Departamento" 
              options={mapToOptions(departments, 'name', 'id_departament')} 
              onChange={(value) => field.onChange(value)} 
              value={field.value} 
              disabled={isLoadingDepartments || !watchedProvinceId} 
            />
          )} />
          <Controller name="id_city" control={control} render={({ field }) => (
            <Select 
              label="Ciudad" 
              options={mapToOptions(cities, 'name', 'id_city')} 
              onChange={field.onChange} 
              value={field.value} 
              disabled={isLoadingCities || !watchedDepartmentId} 
            />
          )} />
        </div>
      </div>

      {/* Work Info */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">Información Laboral</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller name="id_type_provider" control={control} render={({ field }) => (<Select label="Tipo de Proveedor" options={mapToOptions(providerTypes, 'name', 'id_type_provider')} onChange={field.onChange} value={field.value} />)} />
          <Controller name="id_profession" control={control} render={({ field }) => (<Select label="Profesión" options={mapToOptions(professions, 'name', 'id_profession')} onChange={field.onChange} value={field.value} />)} />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Volver
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
};

export default EditProviderForm;