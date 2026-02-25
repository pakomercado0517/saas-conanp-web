export type EcosystemType = "terrestre" | "maritimo" | "mixto";

export interface Organization {
  id: string;
  name: string;
  ecosystem_type: EcosystemType;
  settings: Record<string, unknown>;
  /** ID de la dependencia padre (cuando la API lo incluya). */
  dependenciaId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Alias semántico: en el modelo de negocio la unidad operativa es el "Área" (ANP).
 * Se mantiene Organization por compatibilidad con la API; Area = Organization.
 * Para una futura migración a rutas /areas/:areaId, el segmento seguirá siendo el mismo ID.
 */
export type Area = Organization;

/** ID del área (ANP). Técnicamente coincide con organizationId en la API actual. */
export type AreaId = string;

export interface ListOrganizationsParams {
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "ecosystem_type" | "updatedAt";
  sortOrder?: "asc" | "desc";
  name?: string;
  ecosystem_type?: EcosystemType;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListOrganizationsResponse {
  success: true;
  data: Organization[];
  pagination: PaginationMeta;
  message?: string;
}

export interface ConfigAccesoData {
  organizationId: string;
  name: string;
  acceso: {
    brazaletesObligatorios: boolean | null;
    brazaletesExcluyenLocales: boolean;
  };
}

export interface GetOrganizationResponse {
  success: true;
  data: Organization;
  message?: string;
}

export interface GetConfigAccesoResponse {
  success: true;
  data: ConfigAccesoData;
  message?: string;
}
