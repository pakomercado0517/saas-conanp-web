import { apiRequest } from "@/shared/lib/api";
import type {
  ListPrestadoresParams,
  ListPrestadoresResponse,
  GetPrestadorResponse,
  UpdatePrestadorPayload,
  Prestador,
} from "../types";

const BASE = "/api/v1/organizations";

function buildQuery(params: ListPrestadoresParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listPrestadores(
  organizationId: string,
  params: ListPrestadoresParams = {},
  accessToken?: string | null
): Promise<ListPrestadoresResponse> {
  const query = buildQuery(params);
  return apiRequest<ListPrestadoresResponse>(
    `${BASE}/${organizationId}/prestadores${query}`,
    { method: "GET", accessToken }
  );
}

export async function getPrestador(
  organizationId: string,
  prestadorId: string,
  accessToken?: string | null
): Promise<GetPrestadorResponse> {
  return apiRequest<GetPrestadorResponse>(
    `${BASE}/${organizationId}/prestadores/${prestadorId}`,
    { method: "GET", accessToken }
  );
}

interface UpdatePrestadorResponse {
  success: true;
  data: Prestador;
  message?: string;
}

export async function updatePrestador(
  organizationId: string,
  prestadorId: string,
  payload: UpdatePrestadorPayload,
  accessToken?: string | null
): Promise<UpdatePrestadorResponse> {
  return apiRequest<UpdatePrestadorResponse>(
    `${BASE}/${organizationId}/prestadores/${prestadorId}`,
    { method: "PATCH", body: payload, accessToken }
  );
}
