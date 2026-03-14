export type EventoStatus =
  | "programado"
  | "en_curso"
  | "completado"
  | "cancelado";

export type AgendaType = "BLOQUES" | "HORARIO_LIBRE";

/** Resumen/forma legacy para validación en event.schema (id, title, status, startAt, endAt). */
export interface EventSummary {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "cancelled" | "completed";
  startAt: string;
  endAt: string;
}

export interface EventoOperativo {
  id: string;
  organizationId: string;
  prestadorId: string;
  actividadId: string;
  date: string;
  bloqueId: string | null;
  startTime: string | null;
  endTime: string | null;
  peopleCount: number;
  status: EventoStatus;
  paymentRequired: boolean;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  PrestadorProfile?: { id: string; userId: string; organizationId: string; status: string };
  Actividad?: { id: string; name: string; agendaType: AgendaType };
  Bloque?: { id: string; name: string; startTime: string; endTime: string };
}

export interface ListEventosParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  actividadId?: string;
  prestadorId?: string;
  status?: EventoStatus;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ListEventosResponse {
  success: true;
  data: EventoOperativo[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  message?: string;
}

export interface CreateEventoPayloadBloques {
  actividadId: string;
  prestadorId: string;
  date: string;
  agendaType: "BLOQUES";
  bloqueId: string;
  peopleCount?: number;
  paymentRequired?: boolean;
}

export interface CreateEventoPayloadHorarioLibre {
  actividadId: string;
  prestadorId: string;
  date: string;
  agendaType: "HORARIO_LIBRE";
  startTime: string;
  endTime: string;
  peopleCount?: number;
  paymentRequired?: boolean;
}

export type CreateEventoPayload =
  | CreateEventoPayloadBloques
  | CreateEventoPayloadHorarioLibre;

export interface GetEventoResponse {
  success: true;
  data: EventoOperativo;
  message?: string;
}

/** Payload parcial para edición (PATCH). */
export type UpdateEventoPayload =
  | Partial<CreateEventoPayloadBloques>
  | Partial<CreateEventoPayloadHorarioLibre>;

export interface UpdateEventoResponse {
  success: true;
  data: EventoOperativo;
  message?: string;
}
