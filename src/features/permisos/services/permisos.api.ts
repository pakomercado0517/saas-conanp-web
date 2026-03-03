import { apiRequest } from "@/shared/lib/api";
import type {
  ListPermisosParams,
  ListPermisosResponse,
  GetPermisoResponse,
  CreatePermisoPayload,
  UpdatePermisoPayload,
  Permiso,
} from "../types";

const BASE = "/api/v1/organizations";

function buildQuery(params: ListPermisosParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.prestadorId) search.set("prestadorId", params.prestadorId);
  if (params.actividadId) search.set("actividadId", params.actividadId);
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listPermisos(
  organizationId: string,
  params: ListPermisosParams = {},
  accessToken?: string | null
): Promise<ListPermisosResponse> {
  const query = buildQuery(params);
  return apiRequest<ListPermisosResponse>(
    `${BASE}/${organizationId}/permisos${query}`,
    { method: "GET", accessToken }
  );
}

export async function getPermiso(
  organizationId: string,
  permisoId: string,
  accessToken?: string | null
): Promise<GetPermisoResponse> {
  return apiRequest<GetPermisoResponse>(
    `${BASE}/${organizationId}/permisos/${permisoId}`,
    { method: "GET", accessToken }
  );
}

interface CreatePermisoResponse {
  success: true;
  data: Permiso;
  message?: string;
}

export async function createPermiso(
  organizationId: string,
  payload: CreatePermisoPayload,
  accessToken?: string | null
): Promise<Permiso> {
  const res = await apiRequest<CreatePermisoResponse>(
    `${BASE}/${organizationId}/permisos`,
    { method: "POST", body: payload, accessToken }
  );
  return (res as CreatePermisoResponse).data;
}

interface UpdatePermisoResponse {
  success: true;
  data: Permiso;
  message?: string;
}

export async function updatePermiso(
  organizationId: string,
  permisoId: string,
  payload: UpdatePermisoPayload,
  accessToken?: string | null
): Promise<Permiso> {
  const res = await apiRequest<UpdatePermisoResponse>(
    `${BASE}/${organizationId}/permisos/${permisoId}`,
    { method: "PATCH", body: payload, accessToken }
  );
  return (res as UpdatePermisoResponse).data;
}

interface DeletePermisoResponse {
  success: true;
  message?: string;
}

export async function deletePermiso(
  organizationId: string,
  permisoId: string,
  accessToken?: string | null
): Promise<void> {
  await apiRequest<DeletePermisoResponse>(
    `${BASE}/${organizationId}/permisos/${permisoId}`,
    { method: "DELETE", accessToken }
  );
}
