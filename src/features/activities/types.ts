export type AgendaType = "BLOQUES" | "HORARIO_LIBRE";

export type NivelImpacto = "bajo" | "medio" | "alto";

export interface Actividad {
  id: string;
  organizationId: string;
  name: string;
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
