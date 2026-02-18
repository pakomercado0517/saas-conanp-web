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
