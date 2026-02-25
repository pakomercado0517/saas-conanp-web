import { apiRequest } from "@/shared/lib/api";

const BASE = "/api/v1/organizations";

export interface EventosPorActividadItem {
  actividadId: string;
  actividadName: string;
  totalEventos: number;
  totalPersonas: number;
  eventosPorStatus: {
    programado: number;
    en_curso: number;
    completado: number;
    cancelado: number;
  };
  fechaInicio: string | null;
  fechaFin: string | null;
}

export interface ReporteEventosPorActividadResponse {
  success: true;
  data: EventosPorActividadItem[];
  message?: string;
}

export interface ReportesEventosPorActividadParams {
  actividadId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

function buildQuery(params: ReportesEventosPorActividadParams): string {
  const search = new URLSearchParams();
  if (params.actividadId) search.set("actividadId", params.actividadId);
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function getReporteEventosPorActividad(
  organizationId: string,
  params: ReportesEventosPorActividadParams = {},
  accessToken?: string | null
): Promise<ReporteEventosPorActividadResponse> {
  const query = buildQuery(params);
  return apiRequest<ReporteEventosPorActividadResponse>(
    `${BASE}/${organizationId}/reportes/eventos-por-actividad${query}`,
    { method: "GET", accessToken }
  );
}
