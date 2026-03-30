import { apiRequest } from "@/shared/lib/api";
import type {
  ListActivosParams,
  ListActivosResponse,
  GetActivoResponse,
  CreateActivoPayload,
  UpdateActivoPayload,
  Activo,
} from "../types";

const BASE = "/api/v1/organizations";

type RawOwner = Partial<{
  id: string;
  userId: string;
  name: string;
  email: string;
  User: { name?: string | null } | null;
}>;

type RawActivo = Partial<{
  id: string;
  organizationId: string;
  type: string;
  tipo: string;
  ownerId: string;
  propietarioId: string;
  status: string;
  nombre: string | null;
  name: string | null;
  titulo: string | null;
  descripcion: string | null;
  capacidadPersonas: number | string | null;
  capacidad: number | string | null;
  capacity: number | string | null;
  createdAt: string;
  updatedAt: string;
  Propietario: RawOwner;
  propietario: RawOwner;
  owner: RawOwner;
  Owner: RawOwner;
}>;

/** Mapea variantes del backend (docs: infraestructura, otro) al tipo de dominio del frontend. */
function normalizeActivoTipo(raw: unknown): Activo["type"] {
  const s =
    typeof raw === "string"
      ? raw.trim().toLowerCase()
      : raw != null
        ? String(raw).trim().toLowerCase()
        : "";
  if (s === "embarcacion" || s === "vehiculo" || s === "guia" || s === "equipo") {
    return s;
  }
  if (s === "infraestructura" || s === "otro") {
    return "equipo";
  }
  return "equipo";
}

/**
 * Mapea status del backend (docs: activo, inactivo, pendiente_validacion) al enum de UI.
 * `activo` en API = activo operativo → se muestra como «Aprobado» en la UI.
 * @see docs/api_routes/activos.md
 */
function normalizeActivoStatus(raw: unknown): Activo["status"] {
  const s =
    typeof raw === "string"
      ? raw.trim().toLowerCase()
      : raw != null
        ? String(raw).trim().toLowerCase()
        : "";
  if (
    s === "pendiente" ||
    s === "aprobado" ||
    s === "rechazado" ||
    s === "suspendido"
  ) {
    return s;
  }
  if (s === "activo") {
    return "aprobado";
  }
  if (s === "pendiente_validacion") {
    return "pendiente";
  }
  if (s === "inactivo") {
    return "rechazado";
  }
  return "pendiente";
}

function normalizeActivo(raw: RawActivo): Activo {
  const rawOwner: RawOwner | undefined =
    raw.Propietario ?? raw.propietario ?? raw.owner ?? raw.Owner;
  const ownerName =
    (rawOwner?.User?.name ?? undefined) ??
    rawOwner?.name ??
    (rawOwner as { nombre?: string | null })?.nombre ??
    rawOwner?.email ??
    undefined;

  const capacidadRaw = raw.capacidadPersonas ?? raw.capacidad ?? raw.capacity;
  const capacidadPersonas =
    typeof capacidadRaw === "number"
      ? capacidadRaw
      : capacidadRaw != null
        ? Number(capacidadRaw)
        : null;

  const nombreRaw = raw.nombre ?? raw.name ?? raw.titulo ?? null;
  const nombre =
    typeof nombreRaw === "string" && nombreRaw.trim().length > 0
      ? nombreRaw.trim()
      : null;

  const ownerId = String(
    raw.ownerId ?? raw.propietarioId ?? rawOwner?.id ?? ""
  );

  return {
    id: String(raw.id ?? ""),
    organizationId: String(raw.organizationId ?? ""),
    type: normalizeActivoTipo(raw.type ?? raw.tipo),
    ownerId,
    status: normalizeActivoStatus(raw.status),
    nombre,
    descripcion: raw.descripcion ?? null,
    capacidadPersonas,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    Propietario:
      rawOwner?.id || ownerId
        ? {
            id: String(rawOwner?.id ?? ownerId),
            name: ownerName,
          }
        : undefined,
  };
}

function buildQuery(params: ListActivosParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.tipo) search.set("tipo", params.tipo);
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listActivos(
  organizationId: string,
  params: ListActivosParams = {}
): Promise<ListActivosResponse> {
  const query = buildQuery(params);
  const res = await apiRequest<ListActivosResponse>(
    `${BASE}/${organizationId}/activos${query}`,
    { method: "GET" }
  );
  const data = (res as ListActivosResponse).data as unknown as RawActivo[];
  return {
    ...(res as ListActivosResponse),
    data: (data ?? []).map(normalizeActivo),
  };
}

const LIST_ACTIVOS_PAGE_LIMIT = 100;

/**
 * Lista activos cuyo propietario coincide con el prestador indicado, recorriendo
 * la paginación del listado por organización (máx. 100 por página).
 */
export async function listActivosOwnedByPrestador(
  organizationId: string,
  ownerPrestadorId: string
): Promise<Activo[]> {
  const result: Activo[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await listActivos(organizationId, {
      page,
      limit: LIST_ACTIVOS_PAGE_LIMIT,
    });
    for (const a of res.data) {
      if (a.ownerId === ownerPrestadorId) {
        result.push(a);
      }
    }
    totalPages = res.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);
  return result;
}

export async function getActivo(
  organizationId: string,
  activoId: string
): Promise<GetActivoResponse> {
  const res = await apiRequest<GetActivoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}`,
    { method: "GET" }
  );
  const raw = (res as GetActivoResponse).data as unknown as RawActivo;
  return { ...(res as GetActivoResponse), data: normalizeActivo(raw) };
}

interface CreateActivoResponse {
  success: true;
  data: RawActivo;
  message?: string;
}

export async function createActivo(
  organizationId: string,
  payload: CreateActivoPayload
): Promise<Activo> {
  const body: {
    organizationId: string;
    ownerId: string;
    type: CreateActivoPayload["type"];
    status?: CreateActivoPayload["status"];
  } = {
    organizationId,
    ownerId: payload.ownerId,
    type: payload.type,
  };
  if (payload.status) body.status = payload.status;
  const res = await apiRequest<CreateActivoResponse>(
    `${BASE}/${organizationId}/activos`,
    { method: "POST", body }
  );
  return normalizeActivo((res as CreateActivoResponse).data);
}

interface UpdateActivoResponse {
  success: true;
  data: RawActivo;
  message?: string;
}

export async function updateActivo(
  organizationId: string,
  activoId: string,
  payload: UpdateActivoPayload
): Promise<Activo> {
  const res = await apiRequest<UpdateActivoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}`,
    { method: "PATCH", body: payload }
  );
  return normalizeActivo((res as UpdateActivoResponse).data);
}

interface DeleteActivoResponse {
  success: true;
  message?: string;
}

export async function deleteActivo(
  organizationId: string,
  activoId: string
): Promise<string | undefined> {
  const res = await apiRequest<DeleteActivoResponse>(
    `${BASE}/${organizationId}/activos/${activoId}`,
    { method: "DELETE" }
  );
  return (res as DeleteActivoResponse).message;
}
