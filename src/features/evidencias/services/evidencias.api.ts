import { apiRequest, getApiBaseUrl } from "@/shared/lib/api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Evidencia, UpdateEvidenciaPayload } from "../types";

const BASE = "/api/v1/organizations";

interface ListEvidenciasResponse {
  success: true;
  data: Evidencia[];
  message?: string;
}

export async function listEvidencias(
  organizationId: string,
  eventoId: string
): Promise<Evidencia[]> {
  const res = await apiRequest<ListEvidenciasResponse>(
    `${BASE}/${organizationId}/eventos/${eventoId}/evidencias`,
    { method: "GET" }
  );
  return (res as ListEvidenciasResponse).data ?? [];
}

export async function uploadEvidencia(
  organizationId: string,
  eventoId: string,
  file: File,
  metadata?: { nombre?: string; descripcion?: string; tipo?: Evidencia["tipo"] }
): Promise<Evidencia> {
  const accessToken = useAuthStore.getState().accessToken;
  const url = `${getApiBaseUrl()}${BASE}/${organizationId}/eventos/${eventoId}/evidencias`;
  const formData = new FormData();
  formData.append("file", file);
  if (metadata?.nombre) formData.append("nombre", metadata.nombre);
  if (metadata?.descripcion) formData.append("descripcion", metadata.descripcion);
  if (metadata?.tipo) formData.append("tipo", metadata.tipo);

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {},
    body: formData,
  });

  const data = (await res.json()) as
    | { success: true; data: Evidencia }
    | { success: false; message?: string };
  if (!res.ok) {
    const err = data as { success: false; message?: string };
    throw new Error(err.message ?? "Error al subir evidencia");
  }
  return (data as { success: true; data: Evidencia }).data;
}

interface UpdateEvidenciaResponse {
  success: true;
  data: Evidencia;
  message?: string;
}

export async function updateEvidencia(
  organizationId: string,
  eventoId: string,
  evidenciaId: string,
  payload: UpdateEvidenciaPayload
): Promise<Evidencia> {
  const res = await apiRequest<UpdateEvidenciaResponse>(
    `${BASE}/${organizationId}/eventos/${eventoId}/evidencias/${evidenciaId}`,
    { method: "PATCH", body: payload }
  );
  return (res as UpdateEvidenciaResponse).data;
}

interface DeleteEvidenciaResponse {
  success: true;
  message?: string;
}

export async function deleteEvidencia(
  organizationId: string,
  eventoId: string,
  evidenciaId: string
): Promise<void> {
  await apiRequest<DeleteEvidenciaResponse>(
    `${BASE}/${organizationId}/eventos/${eventoId}/evidencias/${evidenciaId}`,
    { method: "DELETE" }
  );
}
