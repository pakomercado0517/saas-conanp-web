import type { EventSummary } from "../types";
import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(["draft", "scheduled", "cancelled", "completed"]),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export function validateEvent(input: EventSummary): EventSummary {
  return eventSchema.parse(input);
}

const timeStringSchema = z
  .string()
  .min(1, "La hora es requerida")
  .refine(
    (v) => /^\d{1,2}:\d{2}(:\d{2})?$/.test(v),
    "Formato de hora inválido (HH:mm o HH:mm:ss)"
  );

const baseEventoFields = {
  actividadId: z.string().min(1, "Selecciona una actividad"),
  prestadorId: z.string().min(1, "Selecciona un prestador"),
  activoIds: z
    .array(z.string().min(1, "Selecciona un activo"))
    .min(1, "Selecciona al menos un activo"),
  date: z.string().min(1, "La fecha es requerida"),
  agendaType: z.enum(["BLOQUES", "HORARIO_LIBRE"], {
    message: "Selecciona el tipo de agenda",
  }),
  peopleCount: z.coerce.number().int().min(1, "Mínimo 1 persona").optional().default(1),
  paymentRequired: z.boolean().optional().default(false),
};

/** Objeto base sin refinamientos para poder usar .partial() en update. */
const baseEventoObjectSchema = z.object({
  ...baseEventoFields,
  bloqueId: z.string().optional(),
  startTime: timeStringSchema.optional(),
  endTime: timeStringSchema.optional(),
});

export const createEventoSchema = baseEventoObjectSchema
  .refine(
    (data) => {
      if (data.agendaType === "BLOQUES") return (data.bloqueId?.length ?? 0) > 0;
      return true;
    },
    { message: "Selecciona un bloque", path: ["bloqueId"] }
  )
  .refine(
    (data) => {
      if (data.agendaType !== "HORARIO_LIBRE") return true;
      return (data.startTime?.length ?? 0) > 0 && (data.endTime?.length ?? 0) > 0;
    },
    { message: "Indica hora de inicio y fin", path: ["startTime"] }
  )
  .refine(
    (data) => {
      if (data.agendaType !== "HORARIO_LIBRE" || !data.startTime || !data.endTime)
        return true;
      const toMinutes = (s: string) => {
        const [h, m] = s.split(":").map(Number);
        return (h ?? 0) * 60 + (m ?? 0);
      };
      return toMinutes(data.endTime) > toMinutes(data.startTime);
    },
    { message: "La hora fin debe ser posterior a la hora inicio", path: ["endTime"] }
  );

/** Schema para edición: todos los campos opcionales, sin refinamientos. */
export const updateEventoSchema = baseEventoObjectSchema.partial();

export type CreateEventoFormData = z.infer<typeof createEventoSchema>;
export type UpdateEventoFormData = z.infer<typeof updateEventoSchema>;
