import { apiRequest } from "@/shared/lib/api";
import type {
  ListPrestadoresParams,
  ListPrestadoresResponse,
  GetPrestadorResponse,
  UpdatePrestadorPayload,
  Prestador,
  CreatePrestadorCompletoPayload,
  CreatePrestadorCompletoResponse,
  ListPrestadoresConPermisosParams,
  ListPrestadoresConPermisosResponse,
  PrestadorConPermisosItem,
  PermisoEnListadoConPrestador,
} from "../types";
import { normalizePrestadorStatus } from "../lib/prestador-status";

const BASE = "/api/v1/organizations";

/** Payload crudo: el backend puede usar distintos nombres para el estado. */
type RawPrestador = Partial<Prestador> & {
  estado?: string | null;
  state?: string | null;
  estadoPrestador?: string | null;
};

function pickRawStatus(raw: RawPrestador): unknown {
  return (
    raw.status ??
    raw.estado ??
    raw.state ??
    raw.estadoPrestador
  );
}

function normalizePrestador(raw: RawPrestador): Prestador {
  return {
    id: String(raw.id ?? ""),
    userId: String(raw.userId ?? ""),
    organizationId: String(raw.organizationId ?? ""),
    status: normalizePrestadorStatus(pickRawStatus(raw)),
    name: raw.name ?? null,
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    User: raw.User,
  };
}

/** Soporta `data` como arreglo o envoltorios comunes (`items`, `rows`, etc.). */
function extractPrestadoresListFromResponse(res: unknown): RawPrestador[] {
  if (res == null || typeof res !== "object") return [];
  const r = res as Record<string, unknown>;
  const d = r.data;
  if (Array.isArray(d)) return d as RawPrestador[];
  if (d != null && typeof d === "object") {
    const o = d as Record<string, unknown>;
    if (Array.isArray(o.items)) return o.items as RawPrestador[];
    if (Array.isArray(o.data)) return o.data as RawPrestador[];
    if (Array.isArray(o.rows)) return o.rows as RawPrestador[];
  }
  if (Array.isArray(r.prestadores)) return r.prestadores as RawPrestador[];
  return [];
}

function buildQuery(params: ListPrestadoresParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  return q ? `?${q}` : "";
}

function buildConPermisosQuery(
  params: ListPrestadoresConPermisosParams
): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortOrder) search.set("sortOrder", params.sortOrder);
  if (params.prestadorId) search.set("prestadorId", params.prestadorId);
  if (params.actividadId) search.set("actividadId", params.actividadId);
  if (params.status) search.set("status", params.status);
  if (params.validFrom) search.set("validFrom", params.validFrom);
  if (params.validTo) search.set("validTo", params.validTo);
  if (params.documentUrl) search.set("documentUrl", params.documentUrl);
  if (params.soloVigentes === true) search.set("soloVigentes", "true");
  const q = search.toString();
  return q ? `?${q}` : "";
}

function parsePermisoEnListado(raw: unknown): PermisoEnListadoConPrestador | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = o.id;
  const prestadorId = o.prestadorId;
  const actividadId = o.actividadId;
  if (typeof id !== "string" || typeof prestadorId !== "string" || typeof actividadId !== "string") {
    return null;
  }
  let Actividad: { id: string; name?: string } | undefined;
  const rawAct = o.Actividad;
  if (rawAct != null && typeof rawAct === "object") {
    const a = rawAct as Record<string, unknown>;
    const aid = a.id;
    if (typeof aid === "string") {
      Actividad = {
        id: aid,
        name: typeof a.name === "string" ? a.name : undefined,
      };
    }
  }
  return {
    id,
    prestadorId,
    actividadId,
    validFrom: typeof o.validFrom === "string" ? o.validFrom : undefined,
    validTo: typeof o.validTo === "string" ? o.validTo : undefined,
    status: typeof o.status === "string" ? o.status : undefined,
    Actividad,
  };
}

function parsePrestadorConPermisosItem(
  row: unknown
): PrestadorConPermisosItem | null {
  if (row == null || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const prestadorRaw = o.prestador;
  const permisosRaw = o.permisos;
  if (prestadorRaw == null || typeof prestadorRaw !== "object") return null;
  if (!Array.isArray(permisosRaw)) return null;
  const permisos: PermisoEnListadoConPrestador[] = [];
  for (const p of permisosRaw) {
    const parsed = parsePermisoEnListado(p);
    if (parsed) permisos.push(parsed);
  }
  return {
    prestador: normalizePrestador(prestadorRaw as RawPrestador),
    permisos,
  };
}

/**
 * Prestadores con al menos un permiso en el área, con permisos anidados.
 * @see docs/api_routes/prestadores.md — GET /con-permisos
 */
export async function listPrestadoresConPermisos(
  organizationId: string,
  params: ListPrestadoresConPermisosParams = {}
): Promise<ListPrestadoresConPermisosResponse> {
  const query = buildConPermisosQuery(params);
  const res = await apiRequest<{
    success: true;
    data: unknown;
    pagination: ListPrestadoresConPermisosResponse["pagination"];
    message?: string;
  }>(
    `${BASE}/${organizationId}/prestadores/con-permisos${query}`,
    { method: "GET" }
  );
  const rawList = Array.isArray(res.data) ? res.data : [];
  const data: PrestadorConPermisosItem[] = [];
  for (const row of rawList) {
    const parsed = parsePrestadorConPermisosItem(row);
    if (parsed) data.push(parsed);
  }
  return {
    success: true,
    data,
    pagination: res.pagination,
    message: res.message,
  };
}

export async function listPrestadores(
  organizationId: string,
  params: ListPrestadoresParams = {}
): Promise<ListPrestadoresResponse> {
  const query = buildQuery(params);
  const res = await apiRequest<ListPrestadoresResponse>(
    `${BASE}/${organizationId}/prestadores${query}`,
    { method: "GET" }
  );
  const rawList = extractPrestadoresListFromResponse(res);
  if (
    process.env.NODE_ENV === "development" &&
    rawList.length > 0
  ) {
    const sample = rawList[0] as RawPrestador;
    // Depuración: comparar con Network (GET …/prestadores). Quitar cuando ya no haga falta.
    console.debug("[prestadores API] primer ítem del listado (crudo)", {
      keys: Object.keys(sample as object),
      status: sample.status,
      estado: sample.estado,
      state: sample.state,
      normalizado: normalizePrestador(sample).status,
    });
  }
  return {
    ...(res as ListPrestadoresResponse),
    data: rawList.map(normalizePrestador),
  };
}

export async function getPrestador(
  organizationId: string,
  prestadorId: string
): Promise<GetPrestadorResponse> {
  const res = await apiRequest<GetPrestadorResponse>(
    `${BASE}/${organizationId}/prestadores/${prestadorId}`,
    { method: "GET" }
  );
  const raw = (res as GetPrestadorResponse).data as unknown as RawPrestador;
  return {
    ...(res as GetPrestadorResponse),
    data: normalizePrestador(raw),
  };
}

interface UpdatePrestadorResponse {
  success: true;
  data: Prestador;
  message?: string;
}

export async function updatePrestador(
  organizationId: string,
  prestadorId: string,
  payload: UpdatePrestadorPayload
): Promise<UpdatePrestadorResponse> {
  const res = await apiRequest<UpdatePrestadorResponse>(
    `${BASE}/${organizationId}/prestadores/${prestadorId}`,
    { method: "PATCH", body: payload }
  );
  const raw = (res as UpdatePrestadorResponse).data as unknown as RawPrestador;
  return {
    ...(res as UpdatePrestadorResponse),
    data: normalizePrestador(raw),
  };
}

export async function createPrestadorCompleto(
  organizationId: string,
  payload: CreatePrestadorCompletoPayload
): Promise<CreatePrestadorCompletoResponse> {
  return apiRequest<CreatePrestadorCompletoResponse>(
    `${BASE}/${organizationId}/prestadores/crear-completo`,
    { method: "POST", body: payload }
  );
}
