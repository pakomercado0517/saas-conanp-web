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
  /** Requerido en `GET .../permisos` para listar permisos del prestador (ver docs/api_routes/permisos.md). */
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

/** Resumen para el índice de prestadores con al menos un permiso en el área. */
export interface PrestadorPermisosResumen {
  prestadorId: string;
  displayName: string;
  email?: string;
  totalPermisos: number;
  activosCount: number;
  /** Fin de vigencia más tardía entre los permisos (ISO 8601), si existe. */
  vigenciaHastaMax: string | null;
  /** Actividades distintas (nombres o IDs) asociadas a los permisos en el área. */
  actividadesResumen?: string;
}
