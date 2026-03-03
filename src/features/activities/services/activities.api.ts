import { apiRequest } from "@/shared/lib/api";
import type {
  ListActividadesParams,
  ListActividadesResponse,
  GetActividadResponse,
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
  params: ListActividadesParams = {},
  accessToken?: string | null
): Promise<{ data: Actividad[]; pagination?: ListActividadesResponse["pagination"] }> {
  try {
    const query = buildQuery(params);
    const res = await apiRequest<ListActividadesResponse>(
      `${BASE}/${organizationId}/actividades${query}`,
      { method: "GET", accessToken }
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
  actividadId: string,
  accessToken?: string | null
): Promise<Actividad | null> {
  try {
    const res = await apiRequest<GetActividadResponse>(
      `${BASE}/${organizationId}/actividades/${actividadId}`,
      { method: "GET", accessToken }
    );
    return (res as GetActividadResponse).data;
  } catch {
    return null;
  }
}
