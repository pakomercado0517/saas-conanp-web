import { z } from "zod";

export const prestadorStatusSchema = z.enum(
  ["activo", "inactivo", "suspendido"],
  { message: "Selecciona un estado válido" }
);

export const updatePrestadorSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((v) => v.trim()),
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo electrónico válido")
    .transform((v) => v.trim().toLowerCase()),
  phone: z
    .string()
    .max(50, "El teléfono no puede exceder 50 caracteres")
    .transform((v) => v.trim() || null)
    .nullable(),
  status: prestadorStatusSchema.optional(),
});

export type UpdatePrestadorFormData = z.infer<typeof updatePrestadorSchema>;
