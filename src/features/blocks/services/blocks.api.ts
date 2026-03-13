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
  const q = search.toString();
  return q ? `?${q}` : "";
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
    return {
      data: (res as ListBloquesResponse).data ?? [],
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
    return (res as GetBloqueResponse).data;
  } catch {
    return null;
  }
}

interface CreateBloqueResponse {
  success: true;
  data: Bloque;
  message?: string;
}

export async function createBloque(
  organizationId: string,
  actividadId: string,
  payload: CreateBloquePayload
): Promise<Bloque> {
  const res = await apiRequest<CreateBloqueResponse>(
    `${BASE}/${organizationId}/actividades/${actividadId}/bloques`,
    { method: "POST", body: payload }
  );
  return (res as CreateBloqueResponse).data;
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
  return (res as UpdateBloqueResponse).data;
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
