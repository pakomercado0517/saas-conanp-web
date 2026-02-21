export type EcosystemType = "terrestre" | "maritimo" | "mixto";

export interface Organization {
  id: string;
  name: string;
  ecosystem_type: EcosystemType;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

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
