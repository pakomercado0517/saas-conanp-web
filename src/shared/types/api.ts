/**
 * Tipos de respuesta de error de la API (alineado con docs/api_routes).
 * Prioridad: mostrar siempre el message del backend; fallback solo si no existe.
 */

export interface ApiValidationDetail {
  campo: string;
  mensaje: string;
  codigo?: string;
}

export interface ApiErrorResponse {
  success: false;
  error?: string;
  message?: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
  /** Errores de validación por campo (Zod). */
  detalles?: ApiValidationDetail[];
  timestamp?: string;
}

export interface ApiErrorPayload {
  message: string;
  code?: string;
  statusCode?: number;
  details: Array<{ campo: string; mensaje: string }>;
  /** Copia de `details` de la API cuando no es un array (p. ej. objeto con `code: CAPACITY_EXCEEDED`). */
  detailsRaw?: unknown;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as { success?: boolean }).success === false
  );
}

/**
 * Devuelve el código de error del backend si existe (ej. SUBSCRIPTION_REQUIRED, PLAN_INACTIVE).
 */
export function getApiErrorCode(res: unknown): string | undefined {
  if (isApiErrorResponse(res)) return res.code;
  if (res instanceof ApiError) return res.code;
  if (
    typeof res === "object" &&
    res !== null &&
    "code" in res &&
    typeof (res as { code: unknown }).code === "string"
  ) {
    return (res as { code: string }).code;
  }
  return undefined;
}

/**
 * Devuelve el mensaje de error para mostrar en UI.
 * Prioriza message del backend, luego error, luego fallback en español.
 */
export function getApiErrorMessage(res: unknown): string {
  if (isApiErrorResponse(res)) {
    return res.message ?? res.error ?? "Error de conexión";
  }
  if (res instanceof Error) {
    return res.message;
  }
  if (typeof res === "object" && res !== null && "message" in res && typeof (res as { message: unknown }).message === "string") {
    return (res as { message: string }).message;
  }
  return "Error de conexión";
}

/**
 * Si `details` de la API es un objeto con `code` (p. ej. CAPACITY_EXCEEDED), devuelve ese código.
 */
export function getApiErrorDetailsCode(error: unknown): string | undefined {
  if (error instanceof ApiError && error.detailsRaw !== undefined) {
    const raw = error.detailsRaw;
    if (typeof raw === "object" && raw !== null && "code" in raw) {
      const c = (raw as { code: unknown }).code;
      return typeof c === "string" ? c : undefined;
    }
  }
  if (isApiErrorResponse(error) && error.details !== undefined) {
    const d = error.details;
    if (typeof d === "object" && d !== null && !Array.isArray(d) && "code" in d) {
      const c = (d as { code: unknown }).code;
      return typeof c === "string" ? c : undefined;
    }
  }
  return undefined;
}

/**
 * Devuelve los detalles de validación por campo para setError en formularios.
 * Acepta tanto "detalles" como array en "details" con estructura { campo, mensaje }.
 */
export function getApiValidationDetails(res: unknown): Array<{ campo: string; mensaje: string }> {
  if (!isApiErrorResponse(res)) {
    return [];
  }
  const detalles = res.detalles ?? (Array.isArray(res.details) ? res.details : []);
  return detalles.map((d) => ({
    campo: typeof d === "object" && d !== null && "campo" in d ? String((d as { campo: unknown }).campo) : "unknown",
    mensaje: typeof d === "object" && d !== null && "mensaje" in d ? String((d as { mensaje: unknown }).mensaje) : "",
  }));
}

/**
 * Error lanzado por apiRequest cuando !res.ok.
 * Permite a los formularios acceder a message y details.
 */
export class ApiError extends Error {
  readonly code?: string;
  readonly statusCode?: number;
  readonly details: Array<{ campo: string; mensaje: string }>;
  readonly detailsRaw?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.statusCode = payload.statusCode;
    this.details = payload.details ?? [];
    this.detailsRaw = payload.detailsRaw;
  }

  static fromResponse(res: ApiErrorResponse): ApiError {
    return new ApiError({
      message: res.message ?? res.error ?? "Error de conexión",
      code: res.code,
      statusCode: res.statusCode,
      details: getApiValidationDetails(res),
      detailsRaw: res.details,
    });
  }
}
