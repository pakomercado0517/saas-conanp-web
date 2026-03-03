import { apiRequest } from "@/shared/lib/api";
import type {
  ActivoRequisito,
  CreateRequisitoPayload,
  UpdateRequisitoPayload,
} from "../types";

const BASE = "/api/v1/organizations";

interface ListRequisitosResponse {
  success: true;
  data: ActivoRequisito[];
  message?: string;
}

export async function listRequisitos(
  organizationId: string,
  activoId: string,
  accessToken?: string | null
): Promise<ActivoRequisito[]> {
  const res = await apiRequest<ListRequisitosResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos`,
    { method: "GET", accessToken }
  );
  return (res as ListRequisitosResponse).data ?? [];
}

interface CreateRequisitoResponse {
  success: true;
  data: ActivoRequisito;
  message?: string;
}

export async function createRequisito(
  organizationId: string,
  activoId: string,
  payload: CreateRequisitoPayload,
  accessToken?: string | null
): Promise<ActivoRequisito> {
  const res = await apiRequest<CreateRequisitoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos`,
    { method: "POST", body: payload, accessToken }
  );
  return (res as CreateRequisitoResponse).data;
}

interface UpdateRequisitoResponse {
  success: true;
  data: ActivoRequisito;
  message?: string;
}

export async function updateRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string,
  payload: UpdateRequisitoPayload,
  accessToken?: string | null
): Promise<ActivoRequisito> {
  const res = await apiRequest<UpdateRequisitoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}`,
    { method: "PATCH", body: payload, accessToken }
  );
  return (res as UpdateRequisitoResponse).data;
}

interface DeleteRequisitoResponse {
  success: true;
  message?: string;
}

export async function deleteRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string,
  accessToken?: string | null
): Promise<void> {
  await apiRequest<DeleteRequisitoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}`,
    { method: "DELETE", accessToken }
  );
}

export async function aprobarRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string,
  accessToken?: string | null
): Promise<ActivoRequisito> {
  const res = await apiRequest<{ success: true; data: ActivoRequisito }>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}/aprobar`,
    { method: "POST", accessToken }
  );
  return (res as { success: true; data: ActivoRequisito }).data;
}

export async function rechazarRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string,
  motivo: string,
  accessToken?: string | null
): Promise<ActivoRequisito> {
  const res = await apiRequest<{ success: true; data: ActivoRequisito }>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}/rechazar`,
    { method: "POST", body: { motivo }, accessToken }
  );
  return (res as { success: true; data: ActivoRequisito }).data;
}

export async function suspenderRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string,
  accessToken?: string | null
): Promise<ActivoRequisito> {
  const res = await apiRequest<{ success: true; data: ActivoRequisito }>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}/suspender`,
    { method: "POST", accessToken }
  );
  return (res as { success: true; data: ActivoRequisito }).data;
}
