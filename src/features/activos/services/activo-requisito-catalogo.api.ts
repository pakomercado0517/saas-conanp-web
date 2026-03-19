import { apiRequest } from "@/shared/lib/api";
import type {
  ActivoRequisitoCatalogoItem,
  CreateActivoRequisitoCatalogoPayload,
  UpdateActivoRequisitoCatalogoPayload,
  TipoActivoCatalogo,
} from "../types";

const BASE_ORGANIZATIONS = "/api/v1/organizations";
const BASE_DEPENDENCIAS = "/api/v1/dependencias";

export interface ListActivoRequisitoCatalogoParams {
  tipoActivo?: TipoActivoCatalogo;
}

interface ListActivoRequisitoCatalogoResponse {
  success: true;
  data: RawActivoRequisitoCatalogoItem[];
  message?: string;
}

/** Respuesta cruda del backend (puede enviar key o clave). */
interface RawActivoRequisitoCatalogoItem {
  id?: string;
  dependenciaId?: string;
  tipoActivo?: TipoActivoCatalogo;
  key?: string;
  clave?: string;
  label?: string | null;
  /** Compat: algunos backends guardan 'nombre' o 'name' en vez de 'label'. */
  nombre?: string | null;
  name?: string | null;
  tipoDato?: "string" | "date" | "number";
  requerido?: boolean;
  requiereDocumento?: boolean;
  orden?: number;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeCatalogItem(raw: RawActivoRequisitoCatalogoItem): ActivoRequisitoCatalogoItem {
  const key = (raw.key ?? raw.clave ?? "").trim();
  const tipoActivo = raw.tipoActivo ?? "equipo";
  const labelCandidate = raw.label ?? raw.nombre ?? raw.name ?? null;
  const label = labelCandidate && labelCandidate.trim() ? labelCandidate.trim() : null;
  return {
    id: raw.id ?? `${tipoActivo}:${key}`,
    dependenciaId: raw.dependenciaId,
    tipoActivo,
    key,
    label,
    tipoDato: raw.tipoDato ?? "string",
    requerido: raw.requerido ?? false,
    requiereDocumento: raw.requiereDocumento ?? false,
    orden: raw.orden ?? 0,
    activo: raw.activo ?? true,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function buildQuery(params: ListActivoRequisitoCatalogoParams): string {
  const search = new URLSearchParams();
  if (params.tipoActivo) search.set("tipoActivo", params.tipoActivo);
  const q = search.toString();
  return q ? `?${q}` : "";
}

/** Lista el catálogo por área (organizationId). */
export async function listActivoRequisitoCatalogo(
  organizationId: string,
  params: ListActivoRequisitoCatalogoParams = {}
): Promise<ActivoRequisitoCatalogoItem[]> {
  const query = buildQuery(params);
  const res = await apiRequest<ListActivoRequisitoCatalogoResponse>(
    `${BASE_ORGANIZATIONS}/${organizationId}/activo-requisito-catalogo${query}`,
    { method: "GET" }
  );
  const raw = (res as ListActivoRequisitoCatalogoResponse).data ?? [];
  return raw.map(normalizeCatalogItem).filter((i) => Boolean(i.key));
}

/**
 * Lista el catálogo por dependencia (dependenciaId).
 * Usar cuando el backend almacena activo_requisito_catalogo por dependenciaId.
 * Requiere que la API exponga: GET /api/v1/dependencias/:dependenciaId/activo-requisito-catalogo
 */
export async function listActivoRequisitoCatalogoByDependencia(
  dependenciaId: string,
  params: ListActivoRequisitoCatalogoParams = {}
): Promise<ActivoRequisitoCatalogoItem[]> {
  const query = buildQuery(params);
  const res = await apiRequest<ListActivoRequisitoCatalogoResponse>(
    `${BASE_DEPENDENCIAS}/${dependenciaId}/activo-requisito-catalogo${query}`,
    { method: "GET" }
  );
  const raw = (res as ListActivoRequisitoCatalogoResponse).data ?? [];
  return raw.map(normalizeCatalogItem).filter((i) => Boolean(i.key));
}

interface CreateActivoRequisitoCatalogoResponse {
  success: true;
  data: ActivoRequisitoCatalogoItem;
  message?: string;
}

export async function createActivoRequisitoCatalogoItem(
  organizationId: string,
  payload: CreateActivoRequisitoCatalogoPayload
): Promise<ActivoRequisitoCatalogoItem> {
  const res = await apiRequest<CreateActivoRequisitoCatalogoResponse>(
    `${BASE_ORGANIZATIONS}/${organizationId}/activo-requisito-catalogo`,
    { method: "POST", body: payload }
  );
  return (res as CreateActivoRequisitoCatalogoResponse).data;
}

/** Crea ítem del catálogo por dependencia. */
export async function createActivoRequisitoCatalogoItemByDependencia(
  dependenciaId: string,
  payload: CreateActivoRequisitoCatalogoPayload
): Promise<ActivoRequisitoCatalogoItem> {
  const res = await apiRequest<CreateActivoRequisitoCatalogoResponse>(
    `${BASE_DEPENDENCIAS}/${dependenciaId}/activo-requisito-catalogo`,
    { method: "POST", body: payload }
  );
  return (res as CreateActivoRequisitoCatalogoResponse).data;
}

interface UpdateActivoRequisitoCatalogoResponse {
  success: true;
  data: ActivoRequisitoCatalogoItem;
  message?: string;
}

export async function updateActivoRequisitoCatalogoItem(
  organizationId: string,
  catalogoId: string,
  payload: UpdateActivoRequisitoCatalogoPayload
): Promise<ActivoRequisitoCatalogoItem> {
  const res = await apiRequest<UpdateActivoRequisitoCatalogoResponse>(
    `${BASE_ORGANIZATIONS}/${organizationId}/activo-requisito-catalogo/${catalogoId}`,
    { method: "PATCH", body: payload }
  );
  return (res as UpdateActivoRequisitoCatalogoResponse).data;
}

/** Actualiza ítem del catálogo por dependencia. */
export async function updateActivoRequisitoCatalogoItemByDependencia(
  dependenciaId: string,
  catalogoId: string,
  payload: UpdateActivoRequisitoCatalogoPayload
): Promise<ActivoRequisitoCatalogoItem> {
  const res = await apiRequest<UpdateActivoRequisitoCatalogoResponse>(
    `${BASE_DEPENDENCIAS}/${dependenciaId}/activo-requisito-catalogo/${catalogoId}`,
    { method: "PATCH", body: payload }
  );
  return (res as UpdateActivoRequisitoCatalogoResponse).data;
}

interface DeleteActivoRequisitoCatalogoResponse {
  success: true;
  message?: string;
}

export async function deleteActivoRequisitoCatalogoItem(
  organizationId: string,
  catalogoId: string
): Promise<void> {
  await apiRequest<DeleteActivoRequisitoCatalogoResponse>(
    `${BASE_ORGANIZATIONS}/${organizationId}/activo-requisito-catalogo/${catalogoId}`,
    { method: "DELETE" }
  );
}

/** Elimina ítem del catálogo por dependencia. */
export async function deleteActivoRequisitoCatalogoItemByDependencia(
  dependenciaId: string,
  catalogoId: string
): Promise<void> {
  await apiRequest<DeleteActivoRequisitoCatalogoResponse>(
    `${BASE_DEPENDENCIAS}/${dependenciaId}/activo-requisito-catalogo/${catalogoId}`,
    { method: "DELETE" }
  );
}
