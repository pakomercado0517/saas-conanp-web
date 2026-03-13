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
