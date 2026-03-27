import { apiRequest } from "@/shared/lib/api";
import {
  getDefaultTimeZone,
  toApiUtcFromDateInput,
} from "@/shared/lib/date";
import type {
  ListPermisosParams,
  ListPermisosResponse,
  GetPermisoResponse,
  CreatePermisoPayload,
  UpdatePermisoPayload,
  Permiso,
  PermisoStatus,
} from "../types";

const BASE = "/api/v1/organizations";

const PERMISO_STATUSES: readonly PermisoStatus[] = [
  "activo",
  "inactivo",
  "vencido",
  "suspendido",
];

function parsePermisoStatus(value: unknown): PermisoStatus {
  if (
    typeof value === "string" &&
    PERMISO_STATUSES.includes(value as PermisoStatus)
  ) {
    return value as PermisoStatus;
  }
  return "inactivo";
}

/** Respuesta wire del API (nombres en inglés según documentación backend). */
interface PermisoWire {
  id: string;
  organizationId: string;
  prestadorId: string;
  actividadId: string;
  status?: unknown;
  validFrom?: string;
  validTo?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  documentUrl?: string | null;
  documentoUrl?: string | null;
  /** Alcance multi-área (camelCase en JSON). */
  appliesToAllAreas?: unknown;
  /** Variante en español que puede enviar el backend. */
  aplicaTodasLasAreas?: unknown;
  applies_to_all_areas?: unknown;
  createdAt?: string;
  updatedAt?: string;
  Prestador?: Permiso["Prestador"];
  Actividad?: Permiso["Actividad"];
}

function parseAppliesToAllAreas(raw: PermisoWire): boolean {
  const v =
    raw.appliesToAllAreas ??
    raw.aplicaTodasLasAreas ??
    raw.applies_to_all_areas;
  if (v === true || v === 1) return true;
  if (typeof v === "string" && v.toLowerCase() === "true") return true;
  return false;
}

function mapPermisoFromWire(raw: PermisoWire): Permiso {
  const desde =
    typeof raw.validFrom === "string"
      ? raw.validFrom
      : typeof raw.vigenciaDesde === "string"
        ? raw.vigenciaDesde
        : "";
  const hasta =
    typeof raw.validTo === "string"
      ? raw.validTo
      : typeof raw.vigenciaHasta === "string"
        ? raw.vigenciaHasta
        : "";
  const doc =
    raw.documentUrl !== undefined && raw.documentUrl !== null
      ? raw.documentUrl
      : raw.documentoUrl !== undefined
        ? raw.documentoUrl
        : null;

  return {
    id: raw.id,
    organizationId: raw.organizationId,
    prestadorId: raw.prestadorId,
    actividadId: raw.actividadId,
    appliesToAllAreas: parseAppliesToAllAreas(raw),
    status: parsePermisoStatus(raw.status),
    vigenciaDesde: desde,
    vigenciaHasta: hasta,
    documentoUrl: doc,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    Prestador: raw.Prestador,
    Actividad: raw.Actividad,
  };
}

interface CreatePermisoWireBody {
  prestadorId: string;
  actividadId: string;
  validFrom: string;
  validTo: string;
  status?: "activo" | "inactivo";
  documentUrl?: string | null;
  appliesToAllAreas: boolean;
}

function mapCreatePayloadToWire(
  payload: CreatePermisoPayload
): CreatePermisoWireBody {
  const tz = getDefaultTimeZone();
  return {
    prestadorId: payload.prestadorId,
    actividadId: payload.actividadId,
    validFrom: toApiUtcFromDateInput(payload.vigenciaDesde, tz, "start"),
    validTo: toApiUtcFromDateInput(payload.vigenciaHasta, tz, "end"),
    status: payload.status ?? "activo",
    documentUrl:
      payload.documentoUrl && payload.documentoUrl.trim()
        ? payload.documentoUrl.trim()
        : undefined,
    appliesToAllAreas: payload.appliesToAllAreas ?? false,
  };
}

interface UpdatePermisoWireBody {
  validFrom?: string;
  validTo?: string;
  status?: PermisoStatus;
  documentUrl?: string | null;
  appliesToAllAreas?: boolean;
}

function mapUpdatePayloadToWire(
  payload: UpdatePermisoPayload
): UpdatePermisoWireBody {
  const tz = getDefaultTimeZone();
  const body: UpdatePermisoWireBody = {};
  if (payload.vigenciaDesde !== undefined) {
    body.validFrom = toApiUtcFromDateInput(payload.vigenciaDesde, tz, "start");
  }
  if (payload.vigenciaHasta !== undefined) {
    body.validTo = toApiUtcFromDateInput(payload.vigenciaHasta, tz, "end");
  }
  if (payload.status !== undefined) {
    body.status = payload.status;
  }
  if (payload.documentoUrl !== undefined) {
    body.documentUrl =
      payload.documentoUrl && payload.documentoUrl.trim()
        ? payload.documentoUrl.trim()
        : null;
  }
  if (payload.appliesToAllAreas !== undefined) {
    body.appliesToAllAreas = payload.appliesToAllAreas;
  }
  return body;
}

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
  params: ListPermisosParams = {}
): Promise<ListPermisosResponse> {
  const query = buildQuery(params);
  const res = await apiRequest<{
    success: true;
    data: PermisoWire[];
    pagination: ListPermisosResponse["pagination"];
    message?: string;
  }>(`${BASE}/${organizationId}/permisos${query}`, { method: "GET" });
  return {
    success: true,
    data: res.data.map(mapPermisoFromWire),
    pagination: res.pagination,
    message: res.message,
  };
}

export async function getPermiso(
  organizationId: string,
  permisoId: string
): Promise<GetPermisoResponse> {
  const res = await apiRequest<{
    success: true;
    data: PermisoWire;
    message?: string;
  }>(`${BASE}/${organizationId}/permisos/${permisoId}`, { method: "GET" });
  return {
    success: true,
    data: mapPermisoFromWire(res.data),
    message: res.message,
  };
}

interface CreatePermisoResponse {
  success: true;
  data: PermisoWire;
  message?: string;
}

export async function createPermiso(
  organizationId: string,
  payload: CreatePermisoPayload
): Promise<Permiso> {
  const body = mapCreatePayloadToWire(payload);
  const res = await apiRequest<CreatePermisoResponse>(
    `${BASE}/${organizationId}/permisos`,
    { method: "POST", body }
  );
  return mapPermisoFromWire(res.data);
}

interface UpdatePermisoResponse {
  success: true;
  data: PermisoWire;
  message?: string;
}

export async function updatePermiso(
  organizationId: string,
  permisoId: string,
  payload: UpdatePermisoPayload
): Promise<Permiso> {
  const body = mapUpdatePayloadToWire(payload);
  const res = await apiRequest<UpdatePermisoResponse>(
    `${BASE}/${organizationId}/permisos/${permisoId}`,
    { method: "PATCH", body }
  );
  return mapPermisoFromWire(res.data);
}
