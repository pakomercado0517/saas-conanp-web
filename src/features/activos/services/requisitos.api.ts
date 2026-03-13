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
  activoId: string
): Promise<ActivoRequisito[]> {
  const res = await apiRequest<ListRequisitosResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos`,
    { method: "GET" }
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
  payload: CreateRequisitoPayload
): Promise<ActivoRequisito> {
  const res = await apiRequest<CreateRequisitoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos`,
    { method: "POST", body: payload }
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
  payload: UpdateRequisitoPayload
): Promise<ActivoRequisito> {
  const res = await apiRequest<UpdateRequisitoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}`,
    { method: "PATCH", body: payload }
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
  requisitoId: string
): Promise<void> {
  await apiRequest<DeleteRequisitoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}`,
    { method: "DELETE" }
  );
}

export async function aprobarRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string
): Promise<ActivoRequisito> {
  const res = await apiRequest<{ success: true; data: ActivoRequisito }>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}/aprobar`,
    { method: "POST" }
  );
  return (res as { success: true; data: ActivoRequisito }).data;
}

export async function rechazarRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string,
  motivo: string
): Promise<ActivoRequisito> {
  const res = await apiRequest<{ success: true; data: ActivoRequisito }>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}/rechazar`,
    { method: "POST", body: { motivo } }
  );
  return (res as { success: true; data: ActivoRequisito }).data;
}

export async function suspenderRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string
): Promise<ActivoRequisito> {
  const res = await apiRequest<{ success: true; data: ActivoRequisito }>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}/suspender`,
    { method: "POST" }
  );
  return (res as { success: true; data: ActivoRequisito }).data;
}
