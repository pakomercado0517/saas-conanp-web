import { z } from "zod";

export const agendaTypeSchema = z.enum(["BLOQUES", "HORARIO_LIBRE"], {
  message: "Selecciona un tipo de agenda válido",
});

export const actividadTypeSchema = z.enum(
  ["terrestre", "maritima", "mixta"],
  { message: "Selecciona un tipo de actividad válido" }
);

export const impactLevelSchema = z.enum(["bajo", "medio", "alto"], {
  message: "Selecciona un nivel de impacto válido",
});

const impactLevelFormSchema = z
  .union([impactLevelSchema, z.literal("")])
  .transform((v) => (v === "" ? null : v))
  .optional()
  .nullable();

export const createActividadSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((v) => v.trim()),
  type: actividadTypeSchema,
  agendaType: agendaTypeSchema,
  requiresGuide: z.boolean().optional().default(false),
  impactLevel: impactLevelFormSchema,
  active: z.boolean().optional().default(true),
});

export const updateActividadSchema = createActividadSchema.partial();

export type CreateActividadFormData = z.infer<typeof createActividadSchema>;
export type UpdateActividadFormData = z.infer<typeof updateActividadSchema>;
