import { apiRequest } from "@/shared/lib/api";
import type {
  ActivoRequisito,
  CreateRequisitoPayload,
  UpdateRequisitoPayload,
} from "../types";

const BASE = "/api/v1/organizations";

/** Respuesta cruda del backend (puede enviar key o clave, value o valor, documentUrl o documentoUrl). */
interface RawActivoRequisito {
  id: string;
  activoId: string;
  clave?: string;
  key?: string;
  valor?: string;
  value?: string;
  documentoUrl?: string | null;
  documentUrl?: string | null;
  status: ActivoRequisito["status"];
  createdAt?: string;
  updatedAt?: string;
}

function normalizeRequisito(raw: RawActivoRequisito): ActivoRequisito {
  return {
    id: raw.id,
    activoId: raw.activoId,
    clave: raw.key ?? raw.clave ?? "",
    valor: raw.value ?? raw.valor ?? "",
    documentoUrl: raw.documentUrl ?? raw.documentoUrl ?? null,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

interface ListRequisitosResponse {
  success: true;
  data: RawActivoRequisito[];
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
  const raw = (res as ListRequisitosResponse).data ?? [];
  return raw.map(normalizeRequisito);
}

interface CreateRequisitoResponse {
  success: true;
  data: RawActivoRequisito;
  message?: string;
}

export async function createRequisito(
  organizationId: string,
  activoId: string,
  payload: CreateRequisitoPayload
): Promise<ActivoRequisito> {
  const body = {
    activoId,
    key: payload.key,
    value: payload.value,
    documentUrl: payload.documentUrl ?? null,
    validated: payload.validated ?? false,
  };
  console.log("[Activos][Requisitos] POST requisito:", {
    organizationId,
    activoId,
    body,
  });
  const res = await apiRequest<CreateRequisitoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos`,
    { method: "POST", body }
  );
  return normalizeRequisito((res as CreateRequisitoResponse).data);
}

interface UpdateRequisitoResponse {
  success: true;
  data: RawActivoRequisito;
  message?: string;
}

export async function updateRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string,
  payload: UpdateRequisitoPayload
): Promise<ActivoRequisito> {
  console.log("[Activos][Requisitos] PATCH requisito:", {
    organizationId,
    activoId,
    requisitoId,
    payload,
  });
  const res = await apiRequest<UpdateRequisitoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}`,
    { method: "PATCH", body: payload }
  );
  return normalizeRequisito((res as UpdateRequisitoResponse).data);
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
  const res = await apiRequest<{ success: true; data: RawActivoRequisito }>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}/aprobar`,
    { method: "POST" }
  );
  return normalizeRequisito((res as { success: true; data: RawActivoRequisito }).data);
}

export async function rechazarRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string,
  motivo: string
): Promise<ActivoRequisito> {
  const res = await apiRequest<{ success: true; data: RawActivoRequisito }>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}/rechazar`,
    { method: "POST", body: { motivo } }
  );
  return normalizeRequisito((res as { success: true; data: RawActivoRequisito }).data);
}

export async function suspenderRequisito(
  organizationId: string,
  activoId: string,
  requisitoId: string
): Promise<ActivoRequisito> {
  const res = await apiRequest<{ success: true; data: RawActivoRequisito }>(
    `${BASE}/${organizationId}/activos/${activoId}/requisitos/${requisitoId}/suspender`,
    { method: "POST" }
  );
  return normalizeRequisito((res as { success: true; data: RawActivoRequisito }).data);
}
