import { apiRequest } from "@/shared/lib/api";
import type {
  ApiSuccessResponse,
  AuthResponseData,
  ForgotPasswordPayload,
  ForgotPasswordResponseData,
  LoginPayload,
  LogoutPayload,
  MeResponseData,
  RefreshPayload,
  RefreshResponseData,
  RegisterPayload,
  RegisterResponseData,
  ResendVerificationPayload,
  ResendVerificationResponseData,
  ResetPasswordPayload,
  ResetPasswordResponseData,
  VerifyEmailResponseData,
} from "../types";

const AUTH_BASE = "/api/v1/auth";

async function request<T>(path: string, options: { method?: string; body?: unknown; accessToken?: string | null } = {}): Promise<T> {
  const { method = "GET", body, accessToken } = options;
  const fullPath = path.startsWith("/") ? path : `${AUTH_BASE}/${path}`;
  const res = await apiRequest<ApiSuccessResponse<T>>(fullPath, {
    method,
    body,
    accessToken: accessToken ?? undefined,
  });
  return (res as ApiSuccessResponse<T>).data;
}

/** POST /register */
export async function register(payload: RegisterPayload): Promise<RegisterResponseData> {
  return request<RegisterResponseData>("register", { method: "POST", body: payload });
}

/** POST /login */
export async function login(payload: LoginPayload): Promise<AuthResponseData> {
  return request<AuthResponseData>("login", { method: "POST", body: payload });
}

/** GET /verify-email?token= */
export async function verifyEmail(token: string): Promise<VerifyEmailResponseData> {
  const params = new URLSearchParams({ token });
  return request<VerifyEmailResponseData>(`verify-email?${params.toString()}`);
}

/** POST /resend-verification */
export async function resendVerification(payload: ResendVerificationPayload): Promise<ResendVerificationResponseData> {
  return request<ResendVerificationResponseData>("resend-verification", { method: "POST", body: payload });
}

/** POST /forgot-password */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponseData> {
  return request<ForgotPasswordResponseData>("forgot-password", { method: "POST", body: payload });
}

/** POST /reset-password */
export async function resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponseData> {
  return request<ResetPasswordResponseData>("reset-password", { method: "POST", body: payload });
}

/** POST /refresh */
export async function refresh(payload: RefreshPayload): Promise<RefreshResponseData> {
  return request<RefreshResponseData>("refresh", { method: "POST", body: payload });
}

/** POST /logout (204 No Content) */
export async function logout(payload: LogoutPayload): Promise<void> {
  await request<Record<string, never>>("logout", { method: "POST", body: payload });
}

/** GET /me (requiere Authorization). Opcionalmente pasa onUnauthorized para reintentar con refresh en 401. */
export async function me(
  accessToken: string,
  onUnauthorized?: () => Promise<string | null>
): Promise<MeResponseData> {
  const fullPath = `${AUTH_BASE}/me`;
  const res = await apiRequest<ApiSuccessResponse<MeResponseData>>(fullPath, {
    method: "GET",
    accessToken,
    onUnauthorized,
  });
  return (res as ApiSuccessResponse<MeResponseData>).data;
}
