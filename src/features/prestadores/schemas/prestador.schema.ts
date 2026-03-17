import { z } from "zod";

export const prestadorStatusSchema = z.enum(
  ["activo", "inactivo", "suspendido"],
  { message: "Selecciona un estado válido" }
);

const activoTipoCrearSchema = z.enum(
  ["embarcacion", "vehiculo", "guia", "equipo"],
  { message: "Selecciona un tipo de activo válido" }
);

export const createPrestadorCompletoSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo es requerido")
      .email("Ingresa un correo electrónico válido")
      .transform((v) => v.trim().toLowerCase()),
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .max(255, "El nombre no puede exceder 255 caracteres")
      .transform((v) => v.trim()),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    status: prestadorStatusSchema.default("activo"),
    /** Valor de input datetime-local (YYYY-MM-DDTHH:mm) o vacío; se convierte a ISO en el submit. */
    permitExpiresAt: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : v)),
    activos: z
      .array(z.object({ type: activoTipoCrearSchema }))
      .optional()
      .default([]),
  });

export type CreatePrestadorCompletoFormData = z.infer<
  typeof createPrestadorCompletoSchema
>;
export type CreatePrestadorCompletoFormInput = z.input<
  typeof createPrestadorCompletoSchema
>;

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
