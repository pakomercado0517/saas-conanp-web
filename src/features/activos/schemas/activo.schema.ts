import { z } from "zod";

export const activoTipoSchema = z.enum([
  "embarcacion",
  "vehiculo",
  "guia",
  "equipo",
]);

export const activoStatusSchema = z.enum([
  "pendiente",
  "aprobado",
  "rechazado",
  "suspendido",
]);

export const createActivoSchema = z.object({
  type: activoTipoSchema,
  propietarioId: z.string().min(1, "Selecciona un propietario"),
  status: activoStatusSchema,
});

export const updateActivoSchema = z.object({
  tipo: activoTipoSchema.optional(),
  propietarioId: z.string().min(1, "Selecciona un propietario").optional(),
  status: activoStatusSchema.optional(),
});

/** Esquema para crear un requisito (API usa key, value, documentUrl). */
export const createRequisitoSchema = z.object({
  key: z.string().min(1, "La clave es requerida"),
  value: z.string().min(1, "El valor es requerido"),
  documentUrl: z.string().optional(),
});

/** Esquema para actualizar un requisito. */
export const updateRequisitoSchema = z.object({
  value: z.string().min(1, "El valor es requerido").optional(),
  documentUrl: z.string().optional().nullable(),
});

/** Esquema para crear ítem del catálogo de requisitos (admin). */
export const createActivoRequisitoCatalogoSchema = z.object({
  tipoActivo: z.enum(["embarcacion", "vehiculo", "guia", "equipo"], {
    message: "Selecciona tipo de activo",
  }),
  key: z.string().min(1, "La clave es requerida"),
  label: z.string().optional(),
  tipoDato: z.enum(["string", "date", "number"], {
    message: "Selecciona tipo de dato",
  }),
  requerido: z.boolean().optional(),
  requiereDocumento: z.boolean().optional(),
  orden: z.number().optional(),
  activo: z.boolean().optional(),
});

/** Esquema para actualizar ítem del catálogo (solo campos editables). */
export const updateActivoRequisitoCatalogoSchema = z.object({
  label: z.string().optional().nullable(),
  tipoDato: z.enum(["string", "date", "number"]).optional(),
  requerido: z.boolean().optional(),
  requiereDocumento: z.boolean().optional(),
  orden: z.number().optional(),
  activo: z.boolean().optional(),
});

export type CreateActivoFormData = z.infer<typeof createActivoSchema>;
export type UpdateActivoFormData = z.infer<typeof updateActivoSchema>;
export type CreateRequisitoFormData = z.infer<typeof createRequisitoSchema>;
export type UpdateRequisitoFormData = z.infer<typeof updateRequisitoSchema>;
export type CreateActivoRequisitoCatalogoFormData = z.infer<
  typeof createActivoRequisitoCatalogoSchema
>;
export type UpdateActivoRequisitoCatalogoFormData = z.infer<
  typeof updateActivoRequisitoCatalogoSchema
>;
