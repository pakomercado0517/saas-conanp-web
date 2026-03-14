import { z } from "zod";

const timeRefine = (data: { startTime?: string; endTime?: string }) => {
  if (!data.startTime || !data.endTime) return true;
  return data.endTime > data.startTime;
};

const timeRefineMessage = {
  message: "La hora de fin debe ser posterior a la de inicio",
  path: ["endTime"],
};

/** Schema para crear bloque plantilla (sin fecha). */
export const createBloquePlantillaSchema = z
  .object({
    startTime: z.string().min(1, "La hora de inicio es requerida"),
    endTime: z.string().min(1, "La hora de fin es requerida"),
    capacidad: z.number().min(1, "La capacidad debe ser al menos 1"),
    plantilla: z.string().optional(),
  })
  .refine(timeRefine, timeRefineMessage);

/** Schema para crear bloque por fecha (con fecha obligatoria). */
const basePorFecha = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  startTime: z.string().min(1, "La hora de inicio es requerida"),
  endTime: z.string().min(1, "La hora de fin es requerida"),
  capacidad: z.number().min(1, "La capacidad debe ser al menos 1"),
  plantilla: z.string().optional(),
});
export const createBloquePorFechaSchema = basePorFecha.refine(
  timeRefine,
  timeRefineMessage
);

/** Schema para edición: todos los campos opcionales, sin refinamientos. */
export const updateBloqueSchema = z.object({
  date: z.string().optional().nullable(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  capacidad: z.number().optional(),
  plantilla: z.string().optional(),
});

export type CreateBloquePlantillaFormData = z.infer<
  typeof createBloquePlantillaSchema
>;
export type CreateBloquePorFechaFormData = z.infer<
  typeof createBloquePorFechaSchema
>;
export type UpdateBloqueFormData = z.infer<typeof updateBloqueSchema>;
