export type PermisoStatus = "vigente" | "vencido" | "revocado" | "pendiente";

export interface Permiso {
  id: string;
  organizationId: string;
  prestadorId: string;
  actividadId: string;
  status: PermisoStatus;
  vigenciaDesde: string;
  vigenciaHasta: string;
  documentoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Prestador?: { id: string; name?: string; email?: string };
  Actividad?: { id: string; name?: string };
}

export interface ListPermisosParams {
  page?: number;
  limit?: number;
  prestadorId?: string;
  actividadId?: string;
  status?: PermisoStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListPermisosResponse {
  success: true;
  data: Permiso[];
  pagination: PaginationMeta;
  message?: string;
}

export interface GetPermisoResponse {
  success: true;
  data: Permiso;
  message?: string;
}

export interface CreatePermisoPayload {
  prestadorId: string;
  actividadId: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  status?: "vigente" | "pendiente";
  documentoUrl?: string | null;
}

export interface UpdatePermisoPayload {
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  status?: PermisoStatus;
  documentoUrl?: string | null;
}
