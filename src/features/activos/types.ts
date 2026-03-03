export type ActivoTipo =
  | "vehiculo"
  | "equipo"
  | "infraestructura"
  | "otro";

export type ActivoStatus =
  | "activo"
  | "inactivo"
  | "suspendido"
  | "pendiente_validacion";

export type RequisitoStatus =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "suspendido";

export interface Activo {
  id: string;
  organizationId: string;
  tipo: ActivoTipo;
  propietarioId: string;
  status: ActivoStatus;
  nombre: string;
  descripcion?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Propietario?: { id: string; name?: string };
}

export interface ActivoRequisito {
  id: string;
  activoId: string;
  clave: string;
  valor: string;
  documentoUrl?: string | null;
  status: RequisitoStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListActivosParams {
  page?: number;
  limit?: number;
  tipo?: ActivoTipo;
  status?: ActivoStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListActivosResponse {
  success: true;
  data: Activo[];
  pagination: PaginationMeta;
  message?: string;
}

export interface GetActivoResponse {
  success: true;
  data: Activo;
  message?: string;
}

export interface CreateActivoPayload {
  tipo: ActivoTipo;
  propietarioId: string;
  nombre: string;
  descripcion?: string | null;
  status?: ActivoStatus;
}

export interface UpdateActivoPayload {
  tipo?: ActivoTipo;
  propietarioId?: string;
  nombre?: string;
  descripcion?: string | null;
  status?: ActivoStatus;
}

export interface CreateRequisitoPayload {
  clave: string;
  valor: string;
  documentoUrl?: string | null;
}

export interface UpdateRequisitoPayload {
  clave?: string;
  valor?: string;
  documentoUrl?: string | null;
}
