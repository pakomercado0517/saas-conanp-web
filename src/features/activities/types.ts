export type AgendaType = "BLOQUES" | "HORARIO_LIBRE";

export type NivelImpacto = "bajo" | "medio" | "alto";

/** Tipo de actividad para la API (body). */
export type ActividadType = "terrestre" | "maritima" | "mixta";

export interface Actividad {
  id: string;
  organizationId: string;
  name: string;
  type?: ActividadType;
  agendaType: AgendaType;
  requiereGuia?: boolean;
  nivelImpacto?: NivelImpacto;
  activoId?: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListActividadesParams {
  page?: number;
  limit?: number;
  agendaType?: AgendaType;
  active?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListActividadesResponse {
  success: true;
  data: Actividad[];
  pagination: PaginationMeta;
  message?: string;
}

export interface GetActividadResponse {
  success: true;
  data: Actividad;
  message?: string;
}

/** Objeto enviado en el body al crear/actualizar actividad (contrato API). */
export interface CreateActividadPayload {
  organizationId: string;
  name: string;
  type: ActividadType;
  agendaType: AgendaType;
  requiresGuide: boolean;
  impactLevel: NivelImpacto;
  active: boolean;
}

export type UpdateActividadPayload = Partial<
  Omit<CreateActividadPayload, "organizationId">
>;

export interface CreateActividadResponse {
  success: true;
  data: Actividad;
  message?: string;
}

export interface UpdateActividadResponse {
  success: true;
  data: Actividad;
  message?: string;
}

/** Parámetros para verificar capacidad (GET capacidad/verificar). */
export interface CapacidadVerificarParams {
  date: string;
  bloqueId: string;
  /** Cantidad a reservar; si se envía, el backend valida si hay cupo. */
  cantidad?: number;
}

/** Respuesta de capacidad/verificar para un bloque y fecha. */
export interface CapacidadVerificarResponse {
  disponible: boolean;
  capacidadTotal: number;
  capacidadUsada: number;
  capacidadDisponible: number;
  limite: number;
}
