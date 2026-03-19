export type ActivoTipo =
  | "embarcacion"
  | "vehiculo"
  | "guia"
  | "equipo";

/** Valores de tipo de activo en el catálogo de requisitos (backend). */
export type TipoActivoCatalogo =
  | "embarcacion"
  | "vehiculo"
  | "guia"
  | "equipo";

/** Tipo de dato del valor de un requisito en el catálogo. */
export type RequisitoTipoDato = "string" | "date" | "number";

export interface ActivoRequisitoCatalogoItem {
  id: string;
  dependenciaId?: string;
  tipoActivo: TipoActivoCatalogo;
  key: string;
  label?: string | null;
  tipoDato: RequisitoTipoDato;
  requerido: boolean;
  requiereDocumento: boolean;
  orden: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateActivoRequisitoCatalogoPayload {
  tipoActivo: TipoActivoCatalogo;
  key: string;
  label?: string | null;
  tipoDato: RequisitoTipoDato;
  requerido?: boolean;
  requiereDocumento?: boolean;
  orden?: number;
  activo?: boolean;
}

export interface UpdateActivoRequisitoCatalogoPayload {
  label?: string | null;
  tipoDato?: RequisitoTipoDato;
  requerido?: boolean;
  requiereDocumento?: boolean;
  orden?: number;
  activo?: boolean;
}

/**
 * Mapea ActivoTipo (frontend) a TipoActivoCatalogo (backend).
 * infraestructura y otro se mapean a equipo si no hay entrada específica en catálogo.
 */
export function activoTipoToTipoActivoCatalogo(
  tipo: ActivoTipo
): TipoActivoCatalogo {
  return tipo;
}

/** Valores de status del activo según contrato API (pendiente, aprobado, rechazado, suspendido). */
export type ActivoStatus =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "suspendido";

export type RequisitoStatus =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "suspendido";

export interface Activo {
  id: string;
  organizationId: string;
  type: ActivoTipo;
  ownerId: string;
  status: ActivoStatus;
  /** Se maneja como requisito (key `nombre`), puede venir vacío. */
  nombre?: string | null;
  descripcion?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Propietario?: { id: string; name?: string };
}

/** Requisito de un activo. En lectura se normaliza key/clave, value/valor, documentUrl/documentoUrl a clave, valor, documentoUrl. */
export interface ActivoRequisito {
  id: string;
  activoId: string;
  /** Canonical key (from API key or clave). */
  clave: string;
  /** Canonical value (from API value or valor). */
  valor: string;
  /** Canonical document URL (from API documentUrl or documentoUrl). */
  documentoUrl?: string | null;
  status: RequisitoStatus;
  createdAt?: string;
  updatedAt?: string;
}

/** Payload para crear requisito (API usa key, value, documentUrl). */
export interface CreateRequisitoPayload {
  key: string;
  value: string;
  documentUrl?: string | null;
  /** Si no se envía, backend debe default = false. */
  validated?: boolean;
}

/** Payload para actualizar requisito (API usa value, documentUrl). */
export interface UpdateRequisitoPayload {
  value?: string;
  documentUrl?: string | null;
}

export interface ListActivosParams {
  page?: number;
  limit?: number;
  tipo?: ActivoTipo;
  status?: ActivoStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListActivosResponse {
  success: true;
  data: Activo[];
  pagination: PaginationMeta;
  message?: string;
}

export interface GetActivoResponse {
  success: true;
  data: Activo;
  message?: string;
}

/** Payload para crear activo (contrato API: organizationId, ownerId, type, status). */
export interface CreateActivoPayload {
  ownerId: string;
  type: ActivoTipo;
  status?: ActivoStatus;
}

export interface UpdateActivoPayload {
  /** Compat: backend puede aceptar `type` o `tipo`. */
  tipo?: ActivoTipo;
  type?: ActivoTipo;
  /** Compat: backend puede aceptar `ownerId` o `propietarioId`. */
  propietarioId?: string;
  ownerId?: string;
  nombre?: string;
  descripcion?: string | null;
  status?: ActivoStatus;
}

