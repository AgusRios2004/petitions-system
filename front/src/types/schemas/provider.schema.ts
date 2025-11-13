import { z } from 'zod';

// This schema defines the data managed BY THE FORM
export const providerProfileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  lastname: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("El correo no es válido").readonly(), // Email likely shouldn't be editable

  // Address fields
  id_address: z.number(), // Keep track of the address ID
  street: z.string().min(1, "La calle es requerida"),
  number: z.string().min(1, "El número es requerido"),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  postal_code: z.string().min(1, "El código postal es requerido"),
  
  // Location IDs
  id_country: z.number(),
  id_province: z.number(),
  id_departament: z.number(),
  id_city: z.number(),

  // Provider-specific fields
  id_type_provider: z.number(),
  id_profession: z.number(),
});

export type ProviderProfileFormData = z.infer<typeof providerProfileSchema>;