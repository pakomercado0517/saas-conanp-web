export type PrestadorStatus = "activo" | "inactivo" | "suspendido";

export interface Prestador {
  id: string;
  userId: string;
  organizationId: string;
  status: PrestadorStatus;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
  User?: { id: string; email: string; name: string };
}

export interface ListPrestadoresParams {
  page?: number;
  limit?: number;
  status?: PrestadorStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListPrestadoresResponse {
  success: true;
  data: Prestador[];
  pagination: PaginationMeta;
  message?: string;
}

export interface GetPrestadorResponse {
  success: true;
  data: Prestador;
  message?: string;
}

export interface UpdatePrestadorPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  status?: PrestadorStatus;
}
