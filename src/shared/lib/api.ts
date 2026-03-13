import type { ApiErrorResponse } from "@/shared/types/api";
import { ApiError } from "@/shared/types/api";

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
};

export function getApiBaseUrl(): string {
  return getBaseUrl().replace(/\/$/, "");
}

// ---------------------------------------------------------------------------
// Auth provider bridge (avoids shared → features import)
// ---------------------------------------------------------------------------

interface AuthTokenProvider {
  getAccessToken: () => string | null;
  setAccessToken: (token: string, expiresIn: number) => void;
  clearSession: () => void;
}

let authProvider: AuthTokenProvider | null = null;

export function registerAuthProvider(provider: AuthTokenProvider): void {
  authProvider = provider;
}

// ---------------------------------------------------------------------------
// Silent token refresh (deduped — concurrent 401s share a single call)
// ---------------------------------------------------------------------------

let refreshPromise: Promise<string | null> | null = null;

export async function silentRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as {
        data: { accessToken: string; expiresIn: number };
      };
      authProvider?.setAccessToken(
        json.data.accessToken,
        json.data.expiresIn,
      );
      return json.data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// API request
// ---------------------------------------------------------------------------

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /**
   * Override the access token. Pass `null` to force an unauthenticated request.
   * Omit (undefined) to auto-inject from the auth store.
   */
  accessToken?: string | null;
  body?: unknown;
  /** Skip the automatic 401 → refresh → retry cycle. */
  skipAuthRetry?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    accessToken: tokenOverride,
    body,
    headers: customHeaders,
    skipAuthRetry,
    ...rest
  } = options;
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  let currentToken =
    tokenOverride !== undefined
      ? (tokenOverride ?? null)
      : (authProvider?.getAccessToken() ?? null);
  let retried = false;

  const doRequest = async (token: string | null): Promise<Response> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(customHeaders as Record<string, string>),
    };
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return fetch(url, {
      ...rest,
      credentials: "include",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  while (true) {
    const res = await doRequest(currentToken);
    const data = (await res.json().catch(() => ({}))) as ApiErrorResponse | T;

    if (!res.ok) {
      if (res.status === 401 && currentToken && !retried && !skipAuthRetry) {
        const newToken = await silentRefresh();
        if (newToken) {
          currentToken = newToken;
          retried = true;
          continue;
        }
        authProvider?.clearSession();
      }
      const err = { success: false as const, ...data } as ApiErrorResponse;
      if (err.statusCode === undefined) err.statusCode = res.status;
      throw ApiError.fromResponse(err);
    }

    return data as T;
  }
}
