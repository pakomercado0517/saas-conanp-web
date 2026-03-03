import { apiRequest } from "@/shared/lib/api";
import type {
  ProductoAcceso,
  CreateProductoAccesoPayload,
  UpdateProductoAccesoPayload,
  RegistrarEntradaPayload,
  RegistrarSalidaPayload,
  ListMovimientosParams,
  Movimiento,
} from "../types";

const BASE = "/api/v1/organizations";

export interface ListProductosAccesoParams {
  page?: number;
  limit?: number;
  tipo?: "brazalete" | "pasaporte";
  active?: boolean;
}

export interface ListProductosAccesoResponse {
  success: true;
  data: ProductoAcceso[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  message?: string;
}

function buildProductosQuery(params: ListProductosAccesoParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.tipo) search.set("tipo", params.tipo);
  if (params.active !== undefined) search.set("active", String(params.active));
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listProductosAcceso(
  organizationId: string,
  params: ListProductosAccesoParams = {},
  accessToken?: string | null
): Promise<ListProductosAccesoResponse> {
  const query = buildProductosQuery(params);
  return apiRequest<ListProductosAccesoResponse>(
    `${BASE}/${organizationId}/productos-acceso${query}`,
    { method: "GET", accessToken }
  );
}

export async function getProductoAcceso(
  organizationId: string,
  productoId: string,
  accessToken?: string | null
): Promise<{ success: true; data: ProductoAcceso; message?: string }> {
  return apiRequest<{ success: true; data: ProductoAcceso; message?: string }>(
    `${BASE}/${organizationId}/productos-acceso/${productoId}`,
    { method: "GET", accessToken }
  );
}

export async function createProductoAcceso(
  organizationId: string,
  payload: CreateProductoAccesoPayload,
  accessToken?: string | null
): Promise<{ success: true; data: ProductoAcceso; message?: string }> {
  return apiRequest<{ success: true; data: ProductoAcceso; message?: string }>(
    `${BASE}/${organizationId}/productos-acceso`,
    { method: "POST", body: payload, accessToken }
  );
}

export async function updateProductoAcceso(
  organizationId: string,
  productoId: string,
  payload: UpdateProductoAccesoPayload,
  accessToken?: string | null
): Promise<{ success: true; data: ProductoAcceso; message?: string }> {
  return apiRequest<{ success: true; data: ProductoAcceso; message?: string }>(
    `${BASE}/${organizationId}/productos-acceso/${productoId}`,
    { method: "PATCH", body: payload, accessToken }
  );
}

export async function deleteProductoAcceso(
  organizationId: string,
  productoId: string,
  accessToken?: string | null
): Promise<{ success: true; message?: string }> {
  return apiRequest<{ success: true; message?: string }>(
    `${BASE}/${organizationId}/productos-acceso/${productoId}`,
    { method: "DELETE", accessToken }
  );
}

export interface ListMovimientosResponse {
  success: true;
  data: Movimiento[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  message?: string;
}

function buildMovimientosQuery(params: ListMovimientosParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.tipo) search.set("tipo", params.tipo);
  if (params.fechaDesde) search.set("fechaDesde", params.fechaDesde);
  if (params.fechaHasta) search.set("fechaHasta", params.fechaHasta);
  if (params.prestadorId) search.set("prestadorId", params.prestadorId);
  if (params.eventoId) search.set("eventoId", params.eventoId);
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listMovimientos(
  organizationId: string,
  productoId: string,
  params: ListMovimientosParams = {},
  accessToken?: string | null
): Promise<ListMovimientosResponse> {
  const query = buildMovimientosQuery(params);
  return apiRequest<ListMovimientosResponse>(
    `${BASE}/${organizationId}/productos-acceso/${productoId}/movimientos${query}`,
    { method: "GET", accessToken }
  );
}

export async function registrarEntrada(
  organizationId: string,
  productoId: string,
  payload: RegistrarEntradaPayload,
  accessToken?: string | null
): Promise<{ success: true; data: Movimiento; message?: string }> {
  return apiRequest<{ success: true; data: Movimiento; message?: string }>(
    `${BASE}/${organizationId}/productos-acceso/${productoId}/entradas`,
    { method: "POST", body: payload, accessToken }
  );
}

export async function registrarSalida(
  organizationId: string,
  productoId: string,
  payload: RegistrarSalidaPayload,
  accessToken?: string | null
): Promise<{ success: true; data: Movimiento; message?: string }> {
  return apiRequest<{ success: true; data: Movimiento; message?: string }>(
    `${BASE}/${organizationId}/productos-acceso/${productoId}/salidas`,
    { method: "POST", body: payload, accessToken }
  );
}
