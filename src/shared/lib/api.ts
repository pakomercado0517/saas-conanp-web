import type { ApiErrorResponse } from "@/shared/types/api";
import { ApiError } from "@/shared/types/api";

const getBaseUrl = (): string => {
  // NEXT_PUBLIC_ es necesario para que la URL esté disponible en el navegador
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
};

export function getApiBaseUrl(): string {
  return getBaseUrl().replace(/\/$/, "");
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  accessToken?: string | null;
  body?: unknown;
  /** Si la respuesta es 401, se llama para obtener un nuevo token; si devuelve un string, se reintenta la request una sola vez. */
  onUnauthorized?: () => Promise<string | null>;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, body, headers: customHeaders, onUnauthorized, ...rest } = options;
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  let currentToken = accessToken ?? null;
  let retried = false;

  const doRequest = async (token: string | null): Promise<Response> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(customHeaders as Record<string, string>),
    };
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  while (true) {
    const res = await doRequest(currentToken);
    const data = (await res.json().catch(() => ({}))) as ApiErrorResponse | T;

    if (!res.ok) {
      if (res.status === 401 && onUnauthorized && !retried) {
        const newToken = await onUnauthorized();
        if (newToken) {
          currentToken = newToken;
          retried = true;
          continue;
        }
      }
      const err = { success: false as const, ...data } as ApiErrorResponse;
      if (err.statusCode === undefined) err.statusCode = res.status;
      throw ApiError.fromResponse(err);
    }

    return data as T;
  }
}
