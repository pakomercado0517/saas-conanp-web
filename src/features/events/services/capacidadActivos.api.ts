import { apiRequest } from "@/shared/lib/api";
import type { AgendaType } from "../types";

export interface CapacidadActivoVerificarParams {
  date: string;
  bloqueId?: string;
  startTime?: string;
  endTime?: string;
  cantidad?: number;
  agendaType: AgendaType;
}

export interface CapacidadActivoVerificarResponse {
  disponible: boolean;
  capacidadTotal: number;
  capacidadUsada: number;
  capacidadDisponible: number;
  limite: number;
  /**
   * Conflictos/eventos que explican por qué no hay disponibilidad.
   * Puede venir omitido dependiendo del backend.
   */
  eventosOcupantes?: Array<{
    id: string;
    peopleCount: number;
    status: string;
    date: string;
    bloqueId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    actividadId?: string;
    prestadorId?: string;
  }>;
}

interface VerificarCapacidadActivoApiResponse {
  success: true;
  data: CapacidadActivoVerificarResponse;
  message?: string;
}

const BASE = "/api/v1/organizations";

function buildQuery(params: Omit<CapacidadActivoVerificarParams, "agendaType">): string {
  const search = new URLSearchParams();
  search.set("date", params.date);
  if (params.bloqueId) search.set("bloqueId", params.bloqueId);
  if (params.startTime) search.set("startTime", params.startTime);
  if (params.endTime) search.set("endTime", params.endTime);
  if (params.cantidad != null) search.set("cantidad", String(params.cantidad));
  const q = search.toString();
  return q ? `?${q}` : "";
}

/**
 * Verifica disponibilidad de capacidad para un activo en un rango temporal.
 * Endpoint asumido por contrato (validar contra backend).
 */
export async function getCapacidadActivoVerificar(
  organizationId: string,
  activoId: string,
  params: CapacidadActivoVerificarParams
): Promise<CapacidadActivoVerificarResponse> {
  const query = buildQuery({
    date: params.date,
    bloqueId: params.bloqueId,
    startTime: params.startTime,
    endTime: params.endTime,
    cantidad: params.cantidad,
  });

  const res = await apiRequest<VerificarCapacidadActivoApiResponse>(
    `${BASE}/${organizationId}/activos/${activoId}/capacidad/verificar${query}`,
    { method: "GET" }
  );

  return (res as VerificarCapacidadActivoApiResponse).data;
}

