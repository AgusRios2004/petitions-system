'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ICustomer, UserProfile } from '@/types/common';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { customerService } from '@/service/customerService';
import toast from 'react-hot-toast';

// TODO: Importar genderService y cityService cuando estén listos
// import { genderService } from '@/service/genderService';
// import { cityService } from '@/service/cityService';

const profileSchema = z.object({
  dni: z.string().min(7, 'El DNI es requerido').max(15, 'El DNI es muy largo'),
  phone: z.string().min(10, 'El teléfono es requerido').max(20, 'El número de teléfono es muy largo'),
  id_gender: z.number().positive('Seleccione un género'),
  address: z.object({
    street: z.string().min(3, 'La calle es requerida'),
    number: z.string().min(1, 'El número es requerido'),
    floor: z.string().optional(),
    apartment: z.string().optional(),
    postal_code: z.string().min(4, 'El código postal es requerido'),
    id_city: z.number().positive('Seleccione una ciudad'),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditCustomerFormProps {
  customer: ICustomer;
  user: UserProfile;
  onFinished: () => void;
}

const EditCustomerForm: React.FC<EditCustomerFormProps> = ({ customer, user, onFinished }) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      dni: customer.dni || '',
      phone: customer.phone || '',
      id_gender: customer.gender?.id_gender || undefined,
      address: {
        street: customer.address?.street || '',
        number: customer.address?.number || '',
        floor: customer.address?.floor || '',
        apartment: customer.address?.apartment || '',
        postal_code: customer.address?.postal_code || '',
        id_city: customer.address?.city?.id_city || undefined,
      },
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      if (!customer.id_customer) {
        throw new Error('ID de cliente no encontrado');
      }
      // El ID de la dirección es necesario para la actualización
      const addressId = customer.address?.id_address;
      if (!addressId) {
        throw new Error('ID de dirección no encontrado');
      }
      const payload = {
        ...data,
        address: {
          ...data.address,
          id_address: addressId,
        },
      };
      return customerService.updateCustomer(customer.id_customer, payload);
    },
    onSuccess: () => {
      toast.success('¡Perfil actualizado con éxito!');
      queryClient.invalidateQueries({ queryKey: ['customerProfile', customer.id_customer] });
      onFinished();
    },
    onError: (error) => {
      console.error('Error al actualizar el perfil: ', error);
      toast.error('Error al actualizar sus datos. Por favor, intente de nuevo.');
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  // --- TODO: Descomentar cuando los servicios estén listos ---
  /*
  const { data: genders, isLoading: isLoadingGenders } = useQuery({
    queryKey: ['genders'],
    queryFn: () => genderService.getGenders(),
  });

  const { data: cities, isLoading: isLoadingCities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => cityService.getCities(),
  });
  */

  // --- Datos Mock mientras se crean los servicios ---
  const genders = [
    { value: 1, label: 'Masculino' },
    { value: 2, label: 'Femenino' },
    { value: 3, label: 'Otro' },
  ];

  const cities = [
    { value: 1, label: 'Ciudad Mock A' },
    { value: 2, label: 'Ciudad Mock B' },
  ];
  const isLoadingGenders = false;
  const isLoadingCities = false;


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Editar Información</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="dni"
          control={control}
          render={({ field }) => <Input {...field} label="DNI" error={errors.dni?.message} />}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => <Input {...field} label="Teléfono" error={errors.phone?.message} />}
        />
        <Controller
          name="id_gender"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Género"
              options={genders}
              error={errors.id_gender?.message}
              disabled={isLoadingGenders}
              placeholder="Seleccione un género..."
            />
          )}
        />
      </div>

      <div className="pt-6 border-t border-gray-700">
        <h4 className="text-xl font-semibold text-white mb-4">Dirección</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="address.street"
            control={control}
            render={({ field }) => <Input {...field} label="Calle" error={errors.address?.street?.message} />}
          />
          <Controller
            name="address.number"
            control={control}
            render={({ field }) => <Input {...field} label="Número" error={errors.address?.number?.message} />}
          />
          <Controller
            name="address.floor"
            control={control}
            render={({ field }) => <Input {...field} label="Piso (Opcional)" error={errors.address?.floor?.message} />}
          />
          <Controller
            name="address.apartment"
            control={control}
            render={({ field }) => <Input {...field} label="Depto (Opcional)" error={errors.address?.apartment?.message} />}
          />
          <Controller
            name="address.postal_code"
            control={control}
            render={({ field }) => <Input {...field} label="Código Postal" error={errors.address?.postal_code?.message} />}
          />
          <Controller
            name="address.id_city"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Ciudad"
                options={cities}
                error={errors.address?.id_city?.message}
                disabled={isLoadingCities}
                placeholder="Seleccione una ciudad..."
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onFinished}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
};

export default EditCustomerForm;