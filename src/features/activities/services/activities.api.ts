import { apiRequest } from "@/shared/lib/api";
import type {
  ListActividadesParams,
  ListActividadesResponse,
  GetActividadResponse,
  CreateActividadPayload,
  CreateActividadResponse,
  UpdateActividadPayload,
  UpdateActividadResponse,
  Actividad,
} from "../types";

const BASE = "/api/v1/organizations";

function buildQuery(params: ListActividadesParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.agendaType) search.set("agendaType", params.agendaType);
  if (params.active !== undefined) search.set("active", String(params.active));
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listActividades(
  organizationId: string,
  params: ListActividadesParams = {}
): Promise<{ data: Actividad[]; pagination?: ListActividadesResponse["pagination"] }> {
  try {
    const query = buildQuery(params);
    const res = await apiRequest<ListActividadesResponse>(
      `${BASE}/${organizationId}/actividades${query}`,
      { method: "GET" }
    );
    return {
      data: (res as ListActividadesResponse).data ?? [],
      pagination: (res as ListActividadesResponse).pagination,
    };
  } catch {
    return { data: [] };
  }
}

export async function getActividad(
  organizationId: string,
  actividadId: string
): Promise<Actividad | null> {
  try {
    const res = await apiRequest<GetActividadResponse>(
      `${BASE}/${organizationId}/actividades/${actividadId}`,
      { method: "GET" }
    );
    return (res as GetActividadResponse).data;
  } catch {
    return null;
  }
}

/** Input para crear actividad (sin organizationId; se añade en el body). */
export type CreateActividadInput = Omit<CreateActividadPayload, "organizationId">;

export async function createActividad(
  organizationId: string,
  input: CreateActividadInput
): Promise<Actividad> {
  const body: CreateActividadPayload = {
    organizationId,
    name: input.name,
    type: input.type,
    agendaType: input.agendaType,
    requiresGuide: input.requiresGuide,
    impactLevel: input.impactLevel,
    active: input.active,
  };
  const res = await apiRequest<CreateActividadResponse>(
    `${BASE}/${organizationId}/actividades`,
    { method: "POST", body }
  );
  return (res as CreateActividadResponse).data;
}

export async function updateActividad(
  organizationId: string,
  actividadId: string,
  payload: UpdateActividadPayload
): Promise<Actividad> {
  const res = await apiRequest<UpdateActividadResponse>(
    `${BASE}/${organizationId}/actividades/${actividadId}`,
    { method: "PATCH", body: payload }
  );
  return (res as UpdateActividadResponse).data;
}
