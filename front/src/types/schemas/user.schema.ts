import z from "zod";

export const userProfileSchema = z.object ({
    name: z.string().min(2, "El nombre es requerido"),
    lastname: z.string().min(2, "El apellido es requerido"),
    email: z.string().email("El correo no es válido"),
})