import { z } from 'zod';

// This schema defines the data managed BY THE FORM
export const providerProfileSchema = z.object({
  // Address fields
  id_address: z.number(), // Keep track of the address ID
  street: z.string().min(1, "La calle es requerida"),
  number: z.string().min(1, "El número es requerido"),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  postal_code: z.string().min(1, "El código postal es requerido"),
  
  // Location IDs
  id_country: z.number().min(1, "Seleccione un país"),
  id_province: z.number().min(1, "Seleccione una provincia"),
  id_department: z.number().min(1, "Seleccione un departamento"),
  id_city: z.number().min(1, "Seleccione una ciudad"),

  // Provider-specific fields
  id_type_provider: z.number(),
  id_profession: z.number(),
});

export type ProviderProfileFormData = z.infer<typeof providerProfileSchema>;