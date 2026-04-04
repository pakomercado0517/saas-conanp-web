import { apiRequest } from "@/shared/lib/api";
import type { CapacidadVerificarParams, CapacidadVerificarResponse } from "../types";

const BASE = "/api/v1/organizations";

function buildQuery(params: CapacidadVerificarParams): string {
  const search = new URLSearchParams();
  search.set("date", params.date);
  if (params.bloqueId != null && params.bloqueId !== "") {
    search.set("bloqueId", params.bloqueId);
  }
  if (params.cantidad != null) search.set("cantidad", String(params.cantidad));
  return `?${search.toString()}`;
}

interface VerificarCapacidadApiResponse {
  success: true;
  data: CapacidadVerificarResponse;
  message?: string;
}

/**
 * Verifica capacidad para la actividad: por bloque (`bloqueId`) o por día (sin `bloqueId`, horario libre).
 * GET .../actividades/:actividadId/capacidad/verificar?date=...&[bloqueId=...]&[cantidad=...]
 */
export async function getCapacidadVerificar(
  organizationId: string,
  actividadId: string,
  params: CapacidadVerificarParams
): Promise<CapacidadVerificarResponse> {
  const query = buildQuery(params);
  const res = await apiRequest<VerificarCapacidadApiResponse>(
    `${BASE}/${organizationId}/actividades/${actividadId}/capacidad/verificar${query}`,
    { method: "GET" }
  );
  return (res as VerificarCapacidadApiResponse).data;
}
