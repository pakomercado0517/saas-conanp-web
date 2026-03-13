import { apiRequest } from "@/shared/lib/api";
import type {
  ListActivosParams,
  ListActivosResponse,
  GetActivoResponse,
  CreateActivoPayload,
  UpdateActivoPayload,
  Activo,
} from "../types";

const BASE = "/api/v1/organizations";

function buildQuery(params: ListActivosParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.tipo) search.set("tipo", params.tipo);
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listActivos(
  organizationId: string,
  params: ListActivosParams = {}
): Promise<ListActivosResponse> {
  const query = buildQuery(params);
  return apiRequest<ListActivosResponse>(
    `${BASE}/${organizationId}/activos${query}`,
    { method: "GET" }
  );
}

export async function getActivo(
  organizationId: string,
  activoId: string
): Promise<GetActivoResponse> {
  return apiRequest<GetActivoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}`,
    { method: "GET" }
  );
}

interface CreateActivoResponse {
  success: true;
  data: Activo;
  message?: string;
}

export async function createActivo(
  organizationId: string,
  payload: CreateActivoPayload
): Promise<Activo> {
  const res = await apiRequest<CreateActivoResponse>(
    `${BASE}/${organizationId}/activos`,
    { method: "POST", body: payload }
  );
  return (res as CreateActivoResponse).data;
}

interface UpdateActivoResponse {
  success: true;
  data: Activo;
  message?: string;
}

export async function updateActivo(
  organizationId: string,
  activoId: string,
  payload: UpdateActivoPayload
): Promise<Activo> {
  const res = await apiRequest<UpdateActivoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}`,
    { method: "PATCH", body: payload }
  );
  return (res as UpdateActivoResponse).data;
}

interface DeleteActivoResponse {
  success: true;
  message?: string;
}

export async function deleteActivo(
  organizationId: string,
  activoId: string
): Promise<void> {
  await apiRequest<DeleteActivoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}`,
    { method: "DELETE" }
  );
}
