import { z } from "zod";

export const activoTipoSchema = z.enum([
  "vehiculo",
  "equipo",
  "infraestructura",
  "otro",
]);

export const activoStatusSchema = z.enum([
  "activo",
  "inactivo",
  "suspendido",
  "pendiente_validacion",
]);

export const createActivoSchema = z.object({
  tipo: activoTipoSchema,
  propietarioId: z.string().min(1, "Selecciona un propietario"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  status: z.enum(["activo", "pendiente_validacion"]).optional(),
});

export const updateActivoSchema = z.object({
  tipo: activoTipoSchema.optional(),
  propietarioId: z.string().min(1, "Selecciona un propietario").optional(),
  nombre: z.string().min(1, "El nombre es requerido").optional(),
  descripcion: z.string().optional().nullable(),
  status: activoStatusSchema.optional(),
});

export const createRequisitoSchema = z.object({
  clave: z.string().min(1, "La clave es requerida"),
  valor: z.string().min(1, "El valor es requerido"),
  documentoUrl: z.string().optional(),
});

export const updateRequisitoSchema = z.object({
  clave: z.string().min(1, "La clave es requerida").optional(),
  valor: z.string().min(1, "El valor es requerido").optional(),
  documentoUrl: z.string().optional().nullable(),
});

export type CreateActivoFormData = z.infer<typeof createActivoSchema>;
export type UpdateActivoFormData = z.infer<typeof updateActivoSchema>;
export type CreateRequisitoFormData = z.infer<typeof createRequisitoSchema>;
export type UpdateRequisitoFormData = z.infer<typeof updateRequisitoSchema>;
