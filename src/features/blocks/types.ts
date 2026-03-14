export interface Bloque {
  id: string;
  actividadId: string;
  /** Fecha del bloque; null en bloques plantilla. */
  date: string | null;
  startTime: string;
  endTime: string;
  /** Normalizado en frontend si el backend devuelve `capacity`. */
  capacidad: number;
  plantilla?: string | null;
  /** Si el backend lo devuelve (plantilla vs materializado). */
  isTemplate?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListBloquesParams {
  page?: number;
  limit?: number;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  /** true = solo plantillas; false = solo bloques con fecha. */
  isTemplate?: boolean;
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
  /** Obligatorio para bloque por fecha; omitir o null para plantilla. */
  date?: string | null;
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
