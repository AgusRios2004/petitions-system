import { z } from 'zod';

export const addressSchema = z.object({
  id_address: z.number().optional(),
  street: z.string().min(3, 'La calle es requerida'),
  number: z.string().min(1, 'El número es requerido'),
  postal_code: z.string().min(4, 'El código postal es requerido'),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  id_country: z.number().min(1, 'Seleccione un país'),
  id_province: z.number().min(1, 'Seleccione una provincia'),
  id_department: z.number().min(1, 'Seleccione un departamento'),
  id_city: z.number().min(1, 'Seleccione una ciudad'),
});

export type AddressFormData = z.infer<typeof addressSchema>;
