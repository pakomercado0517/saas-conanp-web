/**
 * Contratos de API de autenticación (docs/api_routes/session-auth.md).
 * Refresh token viaja en cookie httpOnly; el frontend solo maneja el access token en memoria.
 */

export const AUTH_FEATURE_KEY = "auth";

/** Usuario mínimo para sesión (login/register). */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/** Respuesta estándar exitosa del backend. */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

// --- Payloads (request body) ---

/** invitationId + token (enlace) O invitationId + invitationProof (código manual tras OTP); no ambos. */
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  invitationId: string;
  /** Token del enlace de invitación (flujo por enlace). */
  token?: string;
  /** Comprobante de verify-email/confirm (flujo por código manual). */
  invitationProof?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ResendVerificationPayload {
  email: string;
}

// --- Response data (campo `data` de la respuesta) ---

export interface RegisterResponseData {
  user: AuthUser;
  message: string;
}

/** Login response: refresh token viaja en Set-Cookie, no en body. */
export interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

export interface VerifyEmailResponseData {
  verified: boolean;
}

export interface ResendVerificationResponseData {
  sent: boolean;
}

export interface ForgotPasswordResponseData {
  sent: boolean;
}

export interface ResetPasswordResponseData {
  reset: boolean;
}

export interface RefreshResponseData {
  accessToken: string;
  expiresIn: number;
}

/** GET /me devuelve userId y email (no name en la doc). */
export interface MeResponseData {
  userId: string;
  email: string;
}

// --- Sesión en cliente ---

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
  /** Timestamp (ms) en que expira el access token. */
  expiresAt: number;
}
