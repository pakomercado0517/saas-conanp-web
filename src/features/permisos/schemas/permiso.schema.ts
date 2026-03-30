import { z } from "zod";

const permisoStatusSchema = z.enum([
  "activo",
  "inactivo",
  "vencido",
  "suspendido",
]);

export const createPermisoSchema = z
  .object({
    prestadorId: z.string().min(1, "Selecciona un prestador"),
    actividadId: z.string().min(1, "Selecciona una actividad"),
    appliesToAllAreas: z.boolean(),
    vigenciaDesde: z.string().min(1, "Fecha de inicio requerida"),
    vigenciaHasta: z.string().min(1, "Fecha de fin requerida"),
    status: z.enum(["activo", "inactivo"]),
    documentoUrl: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.vigenciaDesde || !data.vigenciaHasta) return true;
      return data.vigenciaHasta >= data.vigenciaDesde;
    },
    {
      message: "La fecha de fin debe ser posterior o igual a la de inicio",
      path: ["vigenciaHasta"],
    }
  );

export const updatePermisoSchema = z
  .object({
    appliesToAllAreas: z.boolean(),
    vigenciaDesde: z.string().min(1, "Fecha de inicio requerida"),
    vigenciaHasta: z.string().min(1, "Fecha de fin requerida"),
    status: permisoStatusSchema,
    documentoUrl: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.vigenciaDesde || !data.vigenciaHasta) return true;
      return data.vigenciaHasta >= data.vigenciaDesde;
    },
    {
      message: "La fecha de fin debe ser posterior o igual a la de inicio",
      path: ["vigenciaHasta"],
    }
  );

export type CreatePermisoFormData = z.infer<typeof createPermisoSchema>;
export type UpdatePermisoFormData = z.infer<typeof updatePermisoSchema>;
