/**
 * Invitaciones a organización (docs/api_routes/invitations.md).
 */

export interface ValidateInvitationPayload {
  invitationId: string;
  token: string;
}

export interface ValidateInvitationResponseData {
  valid: boolean;
  email: string;
  organizationId: string;
  organizationName: string;
  role: string;
  expiresAt: string;
}

/** POST /api/v1/invitations/verify-email/start — Flujo código manual */
export interface VerifyEmailStartPayload {
  invitationId: string;
  email: string;
}

/** POST /api/v1/invitations/verify-email/confirm — Body */
export interface VerifyEmailConfirmPayload {
  invitationId: string;
  email: string;
  otp: string;
}

/** Respuesta verify-email/confirm: comprobante para POST /auth/register */
export interface VerifyEmailConfirmResponseData {
  invitationProof: string;
  invitationId: string;
  email: string;
  expiresAt: string;
}
