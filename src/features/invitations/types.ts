/**
 * Invitaciones a organización (docs/api_routes/invitations.md).
 */

export interface ValidateInvitationPayload {
  invitationId: string;
  token: string;
}

export type InvitationType = "area" | "dependencia";

export interface ValidateInvitationResponseData {
  valid: boolean;
  email: string;
  /** Tipo de recurso al que pertenece la invitación. */
  type?: InvitationType;
  /** Para invitaciones a nivel área. */
  organizationId?: string;
  organizationName?: string;
  /** Para invitaciones a nivel dependencia. */
  dependenciaId?: string;
  dependenciaName?: string;
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

/** POST /api/v1/organizations/:organizationId/invitations — Crear invitación (admin). */
export interface CreateInvitationPayload {
  email: string;
  role: "admin" | "gestor" | "prestador" | "observador";
}

export interface InvitationItem {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  invitedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListInvitationsResponse {
  success: true;
  data: InvitationItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  message?: string;
}
