import { apiRequest } from "@/shared/lib/api";

const BASE = "/api/v1/organizations";

export interface ProductoAcceso {
  id: string;
  organizationId: string;
  name: string;
  tipo: "brazalete" | "pasaporte";
  vigenciaDias: number;
  precioReferencia: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

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

function buildQuery(params: ListProductosAccesoParams): string {
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
  const query = buildQuery(params);
  return apiRequest<ListProductosAccesoResponse>(
    `${BASE}/${organizationId}/productos-acceso${query}`,
    { method: "GET", accessToken }
  );
}
