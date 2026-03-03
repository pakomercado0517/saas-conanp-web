import { z } from "zod";

export const createBloqueSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  startTime: z.string().min(1, "La hora de inicio es requerida"),
  endTime: z.string().min(1, "La hora de fin es requerida"),
  capacidad: z.number().min(1, "La capacidad debe ser al menos 1"),
  plantilla: z.string().optional(),
}).refine(
  (data) => {
    if (!data.startTime || !data.endTime) return true;
    return data.endTime > data.startTime;
  },
  { message: "La hora de fin debe ser posterior a la de inicio", path: ["endTime"] }
);

export const updateBloqueSchema = createBloqueSchema.partial();

export type CreateBloqueFormData = z.infer<typeof createBloqueSchema>;
export type UpdateBloqueFormData = z.infer<typeof updateBloqueSchema>;
