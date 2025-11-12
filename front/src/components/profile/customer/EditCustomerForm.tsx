'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ICustomer, UserProfile, Country, Province, City, Department, UpdateCustomerPayload } from '@/types/common';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { customerService } from '@/service/customerService';
import toast from 'react-hot-toast';
import { locationService } from '@/service/locationService';

// Schema solo para Info Personal y Dirección
const profileSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  lastname: z.string().min(2, 'El apellido es requerido'),
  dni: z.string().min(7, 'El DNI es requerido'),
  phone: z.string().min(10, 'El teléfono es requerido'),
  
  id_country: z.number().min(1, 'Seleccione un país'),
  id_province: z.number().min(1, 'Seleccione una provincia'),
  id_department: z.number().min(1, 'Seleccione un departamento'),
  id_city: z.number().min(1, 'Seleccione una ciudad'),
  street: z.string().min(3, 'La calle es requerida'),
  number: z.string().min(1, 'El número es requerido'),
  postal_code: z.string().min(4, 'El código postal es requerido'),
  floor: z.string().optional(),
  apartment: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditCustomerFormProps {
  customer: ICustomer;
  user: UserProfile;
  onFinished: () => void;
}

const EditCustomerForm: React.FC<EditCustomerFormProps> = ({ customer, user, onFinished }) => {
  const queryClient = useQueryClient();
  const isInitialLoad = useRef(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      lastname: user.lastname || '',
      dni: customer.dni || '',
      phone: customer.phone || '',
      id_country: 0,
      id_province: 0,
      id_department: 0,
      id_city: customer.address?.city?.id_city || 0,
      street: customer.address?.street || '',
      number: customer.address?.number || '',
      floor: customer.address?.floor || '',
      apartment: customer.address?.apartment || '',
      postal_code: customer.address?.postal_code || '',
    },
  });

  const watchedCountry = watch('id_country');
  const watchedProvince = watch('id_province');
  const watchedDepartment = watch('id_department');

  // --- Lógica de Cascada para Dirección ---
  useEffect(() => {
    if (customer.address) {
      const address = customer.address;
      setValue('id_country', address.city?.department?.province?.country?.id_country || 0);
      setValue('id_province', address?.city?.department?.province?.id_province || 0);
      setValue('id_department', address.city?.department?.id_department || 0);
      setValue('id_city', address.city?.id_city || 0);

      setTimeout(() => {
        isInitialLoad.current = false;
      }, 500);
    }
  }, [customer, setValue]);

  // --- Lógica de Cascada para Resets ---
  useEffect(() => {
    if (!isInitialLoad.current) {
      setValue('id_province', 0);
      setValue('id_department', 0);
      setValue('id_city', 0);
    }
  }, [watchedCountry, setValue]);

  useEffect(() => {
    if (!isInitialLoad.current) {
      setValue('id_department', 0);
      setValue('id_city', 0);
    }
  }, [watchedProvince, setValue]);

  useEffect(() => {
    if (!isInitialLoad.current) {
      setValue('id_city', 0);
    }
  }, [watchedDepartment, setValue]);
  
  // --- Carga de Datos para Dirección ---
  const { data: countries, isLoading: isLoadingCountries } = useQuery({ queryKey: ['countries'], queryFn: locationService.getCountries });
  const { data: provinces, isLoading: isLoadingProvinces } = useQuery({ queryKey: ['provinces', watchedCountry], queryFn: () => locationService.getProvincesByCountry(watchedCountry), enabled: watchedCountry > 0 });
  const { data: departments, isLoading: isLoadingDepartments } = useQuery({ queryKey: ['departments', watchedProvince], queryFn: () => locationService.getDepartmentsByProvince(watchedProvince), enabled: watchedProvince > 0 });
  const { data: cities, isLoading: isLoadingCities } = useQuery({ queryKey: ['cities', watchedDepartment], queryFn: () => locationService.getCitiesByDepartment(watchedDepartment), enabled: watchedDepartment > 0 });

  // --- Mutación para Actualizar el Perfil ---
  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      const payload: Partial<UpdateCustomerPayload> = { // Usamos Partial porque no enviaremos id_interest
        dni: data.dni,
        phone: data.phone,
        address: {
          id_address: customer.address?.id_address,
          street: data.street,
          number: data.number,
          floor: data.floor,
          apartment: data.apartment,
          postal_code: data.postal_code,
          id_city: data.id_city,
        },
      };
      // Aquí también podrías tener una lógica para actualizar el nombre/apellido en un endpoint de usuario
      return customerService.updateCustomer(customer.id_customer, payload as UpdateCustomerPayload);
    },
    onSuccess: () => {
      toast.success('Perfil actualizado con éxito');
      queryClient.invalidateQueries({ queryKey: ['customerProfile', customer.id_customer] });
      onFinished();
    },
    onError: (error: any) => toast.error(`Error al actualizar: ${error.message}`),
  });

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-4 bg-gray-800 rounded-lg">
      
      {/* --- 1. SECCIÓN DE INFO PERSONAL --- */}
      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-2xl font-bold text-white mb-6">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller name="name" control={control} render={({ field }) => <Input {...field} label="Nombre" error={errors.name?.message} />} />
          <Controller name="lastname" control={control} render={({ field }) => <Input {...field} label="Apellido" error={errors.lastname?.message} />} />
          <Controller name="dni" control={control} render={({ field }) => <Input {...field} label="DNI" error={errors.dni?.message} />} />
          <Controller name="phone" control={control} render={({ field }) => <Input {...field} label="Teléfono" error={errors.phone?.message} />} />
        </div>
      </div>

      {/* --- 2. SECCIÓN DE DIRECCIÓN --- */}
      <div className="pb-6">
        <h4 className="text-2xl font-bold text-white mb-6">Dirección</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller name="id_country" control={control} render={({ field }) => ( <Select {...field} value={field.value || 0} label="País" options={countries?.map(c => ({ value: c.id_country, label: c.name })) || []} disabled={isLoadingCountries} placeholder="Seleccione un país..." error={errors.id_country?.message} /> )} />
          <Controller name="id_province" control={control} render={({ field }) => ( <Select {...field} value={field.value || 0} label="Provincia" options={provinces?.map(p => ({ value: p.id_province, label: p.name })) || []} disabled={!watchedCountry || isLoadingProvinces} placeholder="Seleccione una provincia..." error={errors.id_province?.message} /> )} />
          <Controller name="id_department" control={control} render={({ field }) => ( <Select {...field} value={field.value || 0} label="Departamento" options={departments?.map(d => ({ value: d.id_department, label: d.name })) || []} disabled={!watchedProvince || isLoadingDepartments} placeholder="Seleccione un departamento..." error={errors.id_department?.message} /> )} />
          <Controller name="id_city" control={control} render={({ field }) => ( <Select {...field} value={field.value || 0} label="Ciudad" options={cities?.map(c => ({ value: c.id_city, label: c.name })) || []} disabled={!watchedDepartment || isLoadingCities} placeholder="Seleccione una ciudad..." error={errors.id_city?.message} /> )} />
          <Controller name="street" control={control} render={({ field }) => <Input {...field} label="Calle" error={errors.street?.message} />} />
          <Controller name="number" control={control} render={({ field }) => <Input {...field} label="Número" error={errors.number?.message} />} />
          <Controller name="postal_code" control={control} render={({ field }) => <Input {...field} label="Código Postal" error={errors.postal_code?.message} />} />
          <Controller name="floor" control={control} render={({ field }) => <Input {...field} label="Piso (Opcional)" error={errors.floor?.message} />} />
          <Controller name="apartment" control={control} render={({ field }) => <Input {...field} label="Depto (Opcional)" error={errors.apartment?.message} />} />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onFinished}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={mutation.isPending}>{mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}</Button>
      </div>
    </form>
  );
};

export default EditCustomerForm;