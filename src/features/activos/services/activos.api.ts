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
  type: Activo["type"];
  tipo: Activo["type"];
  ownerId: string;
  propietarioId: string;
  status: Activo["status"];
  nombre: string | null;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
  Propietario: RawOwner;
  propietario: RawOwner;
  owner: RawOwner;
  Owner: RawOwner;
}>;

function normalizeActivo(raw: RawActivo): Activo {
  const rawOwner: RawOwner | undefined =
    raw.Propietario ?? raw.propietario ?? raw.owner ?? raw.Owner;
  const ownerName =
    (rawOwner?.User?.name ?? undefined) ??
    rawOwner?.name ??
    rawOwner?.email ??
    undefined;
  return {
    id: String(raw.id ?? ""),
    organizationId: String(raw.organizationId ?? ""),
    type: (raw.type ?? raw.tipo ?? "equipo") as Activo["type"],
    ownerId: String(raw.ownerId ?? raw.propietarioId ?? rawOwner?.id ?? ""),
    status: (raw.status ?? "pendiente") as Activo["status"],
    nombre: raw.nombre ?? null,
    descripcion: raw.descripcion ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    Propietario: rawOwner?.id ? { id: rawOwner.id, name: ownerName } : undefined,
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
