import { apiRequest } from "@/shared/lib/api";
import type {
  ListBloquesParams,
  ListBloquesResponse,
  GetBloqueResponse,
  CreateBloquePayload,
  UpdateBloquePayload,
  Bloque,
} from "../types";

const BASE = "/api/v1/organizations";

function buildQuery(params: ListBloquesParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.date) search.set("date", params.date);
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);
  if (params.isTemplate !== undefined)
    search.set("isTemplate", String(params.isTemplate));
  const q = search.toString();
  return q ? `?${q}` : "";
}

/** Normaliza item de API: backend puede devolver capacity en lugar de capacidad. */
function normalizeBloque(raw: Bloque & { capacity?: number }): Bloque {
  return {
    ...raw,
    capacidad: raw.capacidad ?? raw.capacity ?? 0,
    date: raw.date ?? null,
  };
}

export async function listBloques(
  organizationId: string,
  actividadId: string,
  params: ListBloquesParams = {}
): Promise<{ data: Bloque[]; pagination?: ListBloquesResponse["pagination"] }> {
  try {
    const query = buildQuery(params);
    const res = await apiRequest<ListBloquesResponse>(
      `${BASE}/${organizationId}/actividades/${actividadId}/bloques${query}`,
      { method: "GET" }
    );
    const raw = (res as ListBloquesResponse).data ?? [];
    const data = raw.map((b) =>
      normalizeBloque(b as Bloque & { capacity?: number })
    );
    return {
      data,
      pagination: (res as ListBloquesResponse).pagination,
    };
  } catch {
    return { data: [] };
  }
}

export async function getBloque(
  organizationId: string,
  actividadId: string,
  bloqueId: string
): Promise<Bloque | null> {
  try {
    const res = await apiRequest<GetBloqueResponse>(
      `${BASE}/${organizationId}/actividades/${actividadId}/bloques/${bloqueId}`,
      { method: "GET" }
    );
    const raw = (res as GetBloqueResponse).data;
    return raw ? normalizeBloque(raw as Bloque & { capacity?: number }) : null;
  } catch {
    return null;
  }
}

interface CreateBloqueResponse {
  success: true;
  data: Bloque;
  message?: string;
}

/** Normaliza hora a HH:mm:ss (el input type="time" devuelve HH:mm). */
function toTimeHHmmss(v: string): string {
  if (!v) return v;
  const parts = v.trim().split(":");
  if (parts.length === 2) return `${v}:00`;
  return v;
}

export async function createBloque(
  organizationId: string,
  actividadId: string,
  payload: CreateBloquePayload
): Promise<Bloque> {
  const isPlantilla =
    payload.date == null || payload.date === "";
  const body: Record<string, unknown> = {
    startTime: toTimeHHmmss(payload.startTime),
    endTime: toTimeHHmmss(payload.endTime),
    capacity: payload.capacidad,
    date: isPlantilla ? null : payload.date,
    isTemplate: isPlantilla,
    ...(payload.plantilla != null &&
      payload.plantilla !== "" && { plantilla: payload.plantilla }),
  };
  const url = `${BASE}/${organizationId}/actividades/${actividadId}/bloques`;
  const res = await apiRequest<CreateBloqueResponse>(url, {
    method: "POST",
    body,
  });
  const raw = (res as CreateBloqueResponse).data;
  return normalizeBloque(raw as Bloque & { capacity?: number });
}

interface UpdateBloqueResponse {
  success: true;
  data: Bloque;
  message?: string;
}

export async function updateBloque(
  organizationId: string,
  actividadId: string,
  bloqueId: string,
  payload: UpdateBloquePayload
): Promise<Bloque> {
  const res = await apiRequest<UpdateBloqueResponse>(
    `${BASE}/${organizationId}/actividades/${actividadId}/bloques/${bloqueId}`,
    { method: "PATCH", body: payload }
  );
  const raw = (res as UpdateBloqueResponse).data;
  return normalizeBloque(raw as Bloque & { capacity?: number });
}

export async function deleteBloque(
  organizationId: string,
  actividadId: string,
  bloqueId: string
): Promise<void> {
  await apiRequest<{ success: true; message?: string }>(
    `${BASE}/${organizationId}/actividades/${actividadId}/bloques/${bloqueId}`,
    { method: "DELETE" }
  );
}
