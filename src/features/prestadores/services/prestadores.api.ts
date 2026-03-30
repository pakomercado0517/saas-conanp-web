import { apiRequest } from "@/shared/lib/api";
import type {
  ListPrestadoresParams,
  ListPrestadoresResponse,
  GetPrestadorResponse,
  UpdatePrestadorPayload,
  Prestador,
  CreatePrestadorCompletoPayload,
  CreatePrestadorCompletoResponse,
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
