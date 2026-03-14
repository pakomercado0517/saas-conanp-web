import { apiRequest } from "@/shared/lib/api";
import type {
  ListEventosParams,
  ListEventosResponse,
  EventoOperativo,
  CreateEventoPayload,
  GetEventoResponse,
  UpdateEventoPayload,
  UpdateEventoResponse,
} from "../types";

const BASE = "/api/v1/organizations";

function buildQuery(params: ListEventosParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortOrder) search.set("sortOrder", params.sortOrder);
  if (params.actividadId) search.set("actividadId", params.actividadId);
  if (params.prestadorId) search.set("prestadorId", params.prestadorId);
  if (params.status) search.set("status", params.status);
  if (params.date) search.set("date", params.date);
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listEventos(
  organizationId: string,
  params: ListEventosParams = {}
): Promise<ListEventosResponse> {
  const query = buildQuery(params);
  return apiRequest<ListEventosResponse>(
    `${BASE}/${organizationId}/eventos${query}`,
    { method: "GET" }
  );
}

interface CreateEventoResponse {
  success: true;
  data: EventoOperativo;
  message?: string;
}

export async function getEvento(
  organizationId: string,
  eventoId: string
): Promise<EventoOperativo> {
  const res = await apiRequest<GetEventoResponse>(
    `${BASE}/${organizationId}/eventos/${eventoId}`,
    { method: "GET" }
  );
  return (res as GetEventoResponse).data;
}

export async function createEvento(
  organizationId: string,
  payload: CreateEventoPayload
): Promise<EventoOperativo> {
  const res = await apiRequest<CreateEventoResponse>(
    `${BASE}/${organizationId}/eventos`,
    { method: "POST", body: payload }
  );
  return (res as CreateEventoResponse).data;
}

export async function updateEvento(
  organizationId: string,
  eventoId: string,
  payload: UpdateEventoPayload
): Promise<EventoOperativo> {
  const res = await apiRequest<UpdateEventoResponse>(
    `${BASE}/${organizationId}/eventos/${eventoId}`,
    { method: "PATCH", body: payload }
  );
  return (res as UpdateEventoResponse).data;
}

export async function cancelEvento(
  organizationId: string,
  eventoId: string
): Promise<EventoOperativo> {
  const res = await apiRequest<UpdateEventoResponse>(
    `${BASE}/${organizationId}/eventos/${eventoId}`,
    { method: "PATCH", body: { status: "cancelado" as const } }
  );
  return (res as UpdateEventoResponse).data;
}
