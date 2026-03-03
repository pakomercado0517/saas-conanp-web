export type EvidenciaTipo = "imagen" | "documento" | "otro";

export interface Evidencia {
  id: string;
  eventoId: string;
  nombre: string;
  descripcion?: string | null;
  url: string;
  tipo: EvidenciaTipo;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateEvidenciaPayload {
  nombre?: string;
  descripcion?: string | null;
  tipo?: EvidenciaTipo;
}
