import { z } from 'zod';

export const customerProfileSchema = z.object({
  dni: z.string().min(7, 'El DNI es requerido'),
  phone: z.string().min(10, 'El teléfono es requerido'),
});

export type CustomerProfileFormData = z.infer<typeof customerProfileSchema>;
