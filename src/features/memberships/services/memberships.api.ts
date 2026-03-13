import { apiRequest } from "@/shared/lib/api";
import type {
  ListMembershipsParams,
  ListMembershipsResponse,
  Membership,
  MembershipRole,
  MembershipStatus,
} from "../types";

const BASE = "/api/v1/organizations";

function buildQuery(params: ListMembershipsParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortOrder) search.set("sortOrder", params.sortOrder);
  if (params.role) search.set("role", params.role);
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listMemberships(
  organizationId: string,
  params: ListMembershipsParams = {}
): Promise<ListMembershipsResponse> {
  const query = buildQuery(params);
  return apiRequest<ListMembershipsResponse>(
    `${BASE}/${organizationId}/memberships${query}`,
    { method: "GET" }
  );
}

export interface UpdateMembershipPayload {
  role?: MembershipRole;
  status?: MembershipStatus;
}

interface UpdateMembershipResponse {
  success: true;
  data: Membership;
  message?: string;
}

export async function updateMembership(
  organizationId: string,
  membershipId: string,
  payload: UpdateMembershipPayload
): Promise<UpdateMembershipResponse> {
  return apiRequest<UpdateMembershipResponse>(
    `${BASE}/${organizationId}/memberships/${membershipId}`,
    { method: "PATCH", body: payload }
  );
}

export async function deleteMembership(
  organizationId: string,
  membershipId: string
): Promise<{ success: true; message?: string }> {
  return apiRequest<{ success: true; message?: string }>(
    `${BASE}/${organizationId}/memberships/${membershipId}`,
    { method: "DELETE" }
  );
}
