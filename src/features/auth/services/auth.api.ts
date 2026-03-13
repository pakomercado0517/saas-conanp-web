import { apiRequest, getApiBaseUrl } from "@/shared/lib/api";
import type {
  ApiSuccessResponse,
  AuthResponseData,
  ForgotPasswordPayload,
  ForgotPasswordResponseData,
  LoginPayload,
  MeResponseData,
  RegisterPayload,
  RegisterResponseData,
  ResendVerificationPayload,
  ResendVerificationResponseData,
  ResetPasswordPayload,
  ResetPasswordResponseData,
  VerifyEmailResponseData,
} from "../types";

const AUTH_BASE = "/api/v1/auth";

/**
 * Helper para endpoints de auth que NO requieren sesión.
 * Pasa `accessToken: null` para que apiRequest no auto-inyecte el token del store.
 */
async function publicRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const { method = "GET", body } = options;
  const fullPath = path.startsWith("/") ? path : `${AUTH_BASE}/${path}`;
  const res = await apiRequest<ApiSuccessResponse<T>>(fullPath, {
    method,
    body,
    accessToken: null,
  });
  return res.data;
}

/** POST /register — invitación: invitationId + token (enlace) o invitationId + invitationProof (código manual). */
export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponseData> {
  const body: Record<string, unknown> = {
    email: payload.email,
    password: payload.password,
    name: payload.name,
    invitationId: payload.invitationId,
  };
  if (payload.token) body.token = payload.token;
  else if (payload.invitationProof)
    body.invitationProof = payload.invitationProof;
  return publicRequest<RegisterResponseData>("register", {
    method: "POST",
    body,
  });
}

/** POST /login — Set-Cookie con refresh_token httpOnly. */
export async function login(
  payload: LoginPayload,
): Promise<AuthResponseData> {
  return publicRequest<AuthResponseData>("login", {
    method: "POST",
    body: payload,
  });
}

/** GET /verify-email?token= */
export async function verifyEmail(
  token: string,
): Promise<VerifyEmailResponseData> {
  const params = new URLSearchParams({ token });
  return publicRequest<VerifyEmailResponseData>(
    `verify-email?${params.toString()}`,
  );
}

/** POST /resend-verification */
export async function resendVerification(
  payload: ResendVerificationPayload,
): Promise<ResendVerificationResponseData> {
  return publicRequest<ResendVerificationResponseData>("resend-verification", {
    method: "POST",
    body: payload,
  });
}

/** POST /forgot-password */
export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponseData> {
  return publicRequest<ForgotPasswordResponseData>("forgot-password", {
    method: "POST",
    body: payload,
  });
}

/** POST /reset-password */
export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponseData> {
  return publicRequest<ResetPasswordResponseData>("reset-password", {
    method: "POST",
    body: payload,
  });
}

/**
 * POST /logout — credentials: include para enviar la cookie refresh_token.
 * El backend revoca el token y responde con Clear-Cookie.
 */
export async function logout(): Promise<void> {
  const url = `${getApiBaseUrl()}${AUTH_BASE}/logout`;
  await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
}

/** GET /me — usa el access token auto-inyectado por apiRequest. */
export async function me(): Promise<MeResponseData> {
  const fullPath = `${AUTH_BASE}/me`;
  const res = await apiRequest<ApiSuccessResponse<MeResponseData>>(fullPath, {
    method: "GET",
  });
  return res.data;
}
