import { z } from "zod";

const permisoStatusSchema = z.enum([
  "vigente",
  "vencido",
  "revocado",
  "pendiente",
]);

export const createPermisoSchema = z.object({
  prestadorId: z.string().min(1, "Selecciona un prestador"),
  actividadId: z.string().min(1, "Selecciona una actividad"),
  vigenciaDesde: z.string().min(1, "Fecha de inicio requerida"),
  vigenciaHasta: z.string().min(1, "Fecha de fin requerida"),
  status: z.enum(["vigente", "pendiente"]),
  documentoUrl: z.string().optional(),
}).refine(
  (data) => {
    if (!data.vigenciaDesde || !data.vigenciaHasta) return true;
    return new Date(data.vigenciaHasta) >= new Date(data.vigenciaDesde);
  },
  { message: "La fecha de fin debe ser posterior a la de inicio", path: ["vigenciaHasta"] }
);

export const updatePermisoSchema = z.object({
  vigenciaDesde: z.string().min(1, "Fecha de inicio requerida"),
  vigenciaHasta: z.string().min(1, "Fecha de fin requerida"),
  status: permisoStatusSchema,
  documentoUrl: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (!data.vigenciaDesde || !data.vigenciaHasta) return true;
    return new Date(data.vigenciaHasta) >= new Date(data.vigenciaDesde);
  },
  { message: "La fecha de fin debe ser posterior a la de inicio", path: ["vigenciaHasta"] }
);

export type CreatePermisoFormData = z.infer<typeof createPermisoSchema>;
export type UpdatePermisoFormData = z.infer<typeof updatePermisoSchema>;
