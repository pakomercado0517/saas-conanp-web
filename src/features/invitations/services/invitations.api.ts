import { apiRequest } from "@/shared/lib/api";
import type { ApiSuccessResponse } from "@/features/auth/types";
import type {
  CreateInvitationPayload,
  ValidateInvitationPayload,
  ValidateInvitationResponseData,
  VerifyEmailConfirmPayload,
  VerifyEmailConfirmResponseData,
  VerifyEmailStartPayload,
  ListInvitationsResponse,
  InvitationItem,
} from "../types";

const INVITATIONS_BASE = "/api/v1/invitations";
const ORG_INVITATIONS_BASE = "/api/v1/organizations";

/** POST /api/v1/invitations/validate — Valida token de invitación (público, no consume la invitación). */
export async function validateInvitation(
  payload: ValidateInvitationPayload
): Promise<ValidateInvitationResponseData> {
  const res = await apiRequest<ApiSuccessResponse<ValidateInvitationResponseData>>(
    `${INVITATIONS_BASE}/validate`,
    { method: "POST", body: payload }
  );
  return (res as ApiSuccessResponse<ValidateInvitationResponseData>).data;
}

/** POST /api/v1/invitations/verify-email/start — Envía OTP para flujo código manual. */
export async function verifyEmailStart(
  payload: VerifyEmailStartPayload
): Promise<{ message: string }> {
  const res = await apiRequest<ApiSuccessResponse<{ message: string }>>(
    `${INVITATIONS_BASE}/verify-email/start`,
    { method: "POST", body: payload }
  );
  return (res as ApiSuccessResponse<{ message: string }>).data;
}

/** POST /api/v1/invitations/verify-email/confirm — Devuelve invitationProof para registro. */
export async function verifyEmailConfirm(
  payload: VerifyEmailConfirmPayload
): Promise<VerifyEmailConfirmResponseData> {
  const res = await apiRequest<ApiSuccessResponse<VerifyEmailConfirmResponseData>>(
    `${INVITATIONS_BASE}/verify-email/confirm`,
    { method: "POST", body: payload }
  );
  return (res as ApiSuccessResponse<VerifyEmailConfirmResponseData>).data;
}

/** POST /api/v1/organizations/:organizationId/invitations — Crear invitación (solo admin). */
interface CreateInvitationResponse {
  success: true;
  data: InvitationItem;
  message?: string;
}

export async function createInvitation(
  organizationId: string,
  payload: CreateInvitationPayload,
  accessToken?: string | null
): Promise<InvitationItem> {
  const res = await apiRequest<CreateInvitationResponse>(
    `${ORG_INVITATIONS_BASE}/${organizationId}/invitations`,
    { method: "POST", body: payload, accessToken }
  );
  return (res as CreateInvitationResponse).data;
}

/** GET /api/v1/organizations/:organizationId/invitations — Listar invitaciones (solo admin). */
export async function listInvitations(
  organizationId: string,
  params: { page?: number; limit?: number; status?: string } = {},
  accessToken?: string | null
): Promise<ListInvitationsResponse> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  const query = search.toString();
  return apiRequest<ListInvitationsResponse>(
    `${ORG_INVITATIONS_BASE}/${organizationId}/invitations${query ? `?${query}` : ""}`,
    { method: "GET", accessToken }
  );
}
