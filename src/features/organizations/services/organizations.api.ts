import { apiRequest } from "@/shared/lib/api";
import type {
  ListOrganizationsParams,
  ListOrganizationsResponse,
} from "../types";

const BASE = "/api/v1/organizations";

function buildQuery(params: ListOrganizationsParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortOrder) search.set("sortOrder", params.sortOrder);
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.ecosystem_type) search.set("ecosystem_type", params.ecosystem_type);
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listOrganizations(
  params: ListOrganizationsParams = {},
  accessToken?: string | null
): Promise<ListOrganizationsResponse> {
  const query = buildQuery(params);
  return apiRequest<ListOrganizationsResponse>(`${BASE}${query}`, {
    method: "GET",
    accessToken,
  });
}
