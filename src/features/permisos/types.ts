/** Estados alineados con el backend (permiso.validator). */
export type PermisoStatus = "activo" | "inactivo" | "vencido" | "suspendido";

export interface Permiso {
  id: string;
  organizationId: string;
  prestadorId: string;
  actividadId: string;
  /** Si es true, el permiso aplica en todas las áreas (ANP); evita duplicar el mismo registro por área. */
  appliesToAllAreas: boolean;
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
  /** Obligatorio para listar (contrato API). */
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

/** Payload de dominio (formulario); el servicio mapea a DTO del API. */
export interface CreatePermisoPayload {
  prestadorId: string;
  actividadId: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  status?: "activo" | "inactivo";
  documentoUrl?: string | null;
  appliesToAllAreas?: boolean;
}

export interface UpdatePermisoPayload {
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  status?: PermisoStatus;
  documentoUrl?: string | null;
  appliesToAllAreas?: boolean;
}
