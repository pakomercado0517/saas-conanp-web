import { apiRequest } from "@/shared/lib/api";

const BASE = "/api/v1/organizations";

export interface ReportesEventosPorPrestadorFechaParams {
  prestadorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EventosPorPrestadorFechaItem {
  prestadorId: string;
  prestadorName: string;
  totalEventos: number;
  totalPersonas: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteEventosPorPrestadorFechaResponse {
  success: true;
  data: EventosPorPrestadorFechaItem[];
  message?: string;
}

export interface ReportesCapacidadUtilizadaParams {
  actividadId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CapacidadUtilizadaItem {
  actividadId: string;
  actividadName: string;
  fecha: string;
  capacidadTotal: number;
  capacidadUtilizada: number;
  porcentajeUtilizado?: number;
}

export interface ReporteCapacidadUtilizadaResponse {
  success: true;
  data: CapacidadUtilizadaItem[];
  message?: string;
}

export interface PrestadorActivoItem {
  prestadorId: string;
  prestadorName: string;
  eventosRecientes?: number;
  ultimaActividad?: string;
}

export interface ReportePrestadoresActivosResponse {
  success: true;
  data: PrestadorActivoItem[];
  message?: string;
}

export interface ReportesStockBrazaletesParams {
  productoId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StockBrazaletesItem {
  productoId: string;
  productoName: string;
  stockActual: number;
  entradas?: number;
  salidas?: number;
}

export interface ReporteStockBrazaletesResponse {
  success: true;
  data: StockBrazaletesItem[];
  message?: string;
}

export interface ReportesVentasBrazaletesParams {
  dateFrom?: string;
  dateTo?: string;
  productoId?: string;
}

export interface VentasBrazaletesItem {
  productoId: string;
  productoName: string;
  cantidadVendida: number;
  fecha?: string;
}

export interface ReporteVentasBrazaletesResponse {
  success: true;
  data: VentasBrazaletesItem[];
  message?: string;
}

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
  params: ReportesEventosPorActividadParams = {}
): Promise<ReporteEventosPorActividadResponse> {
  const query = buildQuery(params);
  return apiRequest<ReporteEventosPorActividadResponse>(
    `${BASE}/${organizationId}/reportes/eventos-por-actividad${query}`,
    { method: "GET" }
  );
}

function buildReporteQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) search.set(k, v);
  });
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function getReporteEventosPorPrestadorFecha(
  organizationId: string,
  params: ReportesEventosPorPrestadorFechaParams = {}
): Promise<ReporteEventosPorPrestadorFechaResponse> {
  const query = buildReporteQuery(params as Record<string, string | undefined>);
  return apiRequest<ReporteEventosPorPrestadorFechaResponse>(
    `${BASE}/${organizationId}/reportes/eventos-por-prestador-fecha${query}`,
    { method: "GET" }
  );
}

export async function getReporteCapacidadUtilizada(
  organizationId: string,
  params: ReportesCapacidadUtilizadaParams = {}
): Promise<ReporteCapacidadUtilizadaResponse> {
  const query = buildReporteQuery(params as Record<string, string | undefined>);
  return apiRequest<ReporteCapacidadUtilizadaResponse>(
    `${BASE}/${organizationId}/reportes/capacidad-utilizada${query}`,
    { method: "GET" }
  );
}

export async function getReportePrestadoresActivos(
  organizationId: string
): Promise<ReportePrestadoresActivosResponse> {
  return apiRequest<ReportePrestadoresActivosResponse>(
    `${BASE}/${organizationId}/reportes/prestadores-activos`,
    { method: "GET" }
  );
}

export async function getReporteStockBrazaletes(
  organizationId: string,
  params: ReportesStockBrazaletesParams = {}
): Promise<ReporteStockBrazaletesResponse> {
  const query = buildReporteQuery(params as Record<string, string | undefined>);
  return apiRequest<ReporteStockBrazaletesResponse>(
    `${BASE}/${organizationId}/reportes/stock-brazaletes${query}`,
    { method: "GET" }
  );
}

export async function getReporteVentasBrazaletes(
  organizationId: string,
  params: ReportesVentasBrazaletesParams = {}
): Promise<ReporteVentasBrazaletesResponse> {
  const query = buildReporteQuery(params as Record<string, string | undefined>);
  return apiRequest<ReporteVentasBrazaletesResponse>(
    `${BASE}/${organizationId}/reportes/ventas-brazaletes${query}`,
    { method: "GET" }
  );
}
