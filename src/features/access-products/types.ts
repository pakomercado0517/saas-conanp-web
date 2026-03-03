export type AccessProductsFeatureReady = true;

export type ProductoTipo = "brazalete" | "pasaporte";

export type MovimientoTipo = "entrada" | "salida";

export interface ProductoAcceso {
  id: string;
  organizationId: string;
  name: string;
  tipo: ProductoTipo;
  vigenciaDias: number;
  precioReferencia: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  /** Stock actual si el backend lo incluye */
  stock?: number;
}

export interface Movimiento {
  id: string;
  productoId: string;
  tipo: MovimientoTipo;
  cantidad: number;
  prestadorId: string | null;
  eventoId: string | null;
  observaciones: string | null;
  createdAt: string;
}

export interface CreateProductoAccesoPayload {
  name: string;
  tipo: ProductoTipo;
  vigenciaDias: number;
  precioReferencia?: number | null;
  active?: boolean;
}

export interface UpdateProductoAccesoPayload {
  name?: string;
  tipo?: ProductoTipo;
  vigenciaDias?: number;
  precioReferencia?: number | null;
  active?: boolean;
}

export interface RegistrarEntradaPayload {
  cantidad: number;
  prestadorId?: string | null;
  eventoId?: string | null;
  observaciones?: string | null;
}

export interface RegistrarSalidaPayload {
  cantidad: number;
  prestadorId?: string | null;
  eventoId?: string | null;
  observaciones?: string | null;
}

export interface ListMovimientosParams {
  page?: number;
  limit?: number;
  tipo?: MovimientoTipo;
  fechaDesde?: string;
  fechaHasta?: string;
  prestadorId?: string;
  eventoId?: string;
}
