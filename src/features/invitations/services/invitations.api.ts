import { apiRequest } from "@/shared/lib/api";
import type { ApiSuccessResponse } from "@/features/auth/types";
import type {
  ValidateInvitationPayload,
  ValidateInvitationResponseData,
  VerifyEmailConfirmPayload,
  VerifyEmailConfirmResponseData,
  VerifyEmailStartPayload,
} from "../types";

const INVITATIONS_BASE = "/api/v1/invitations";

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
