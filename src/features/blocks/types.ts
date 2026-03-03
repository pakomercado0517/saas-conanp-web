export interface Bloque {
  id: string;
  actividadId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacidad: number;
  plantilla?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListBloquesParams {
  page?: number;
  limit?: number;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListBloquesResponse {
  success: true;
  data: Bloque[];
  pagination: PaginationMeta;
  message?: string;
}

export interface GetBloqueResponse {
  success: true;
  data: Bloque;
  message?: string;
}

export interface CreateBloquePayload {
  date: string;
  startTime: string;
  endTime: string;
  capacidad: number;
  plantilla?: string | null;
}

export interface UpdateBloquePayload {
  date?: string;
  startTime?: string;
  endTime?: string;
  capacidad?: number;
  plantilla?: string | null;
}
