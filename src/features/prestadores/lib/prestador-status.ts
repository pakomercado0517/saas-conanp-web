import type { PrestadorStatus } from "../types";

const STATUS_RANK: Record<PrestadorStatus, number> = {
  suspendido: 3,
  inactivo: 2,
  activo: 1,
};

/** Etiquetas para UI (producto en español latino). */
export const PRESTADOR_STATUS_LABELS: Record<PrestadorStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  suspendido: "Suspendido",
};

/**
 * Normaliza el estado que venga del backend (`status`, `estado`, variantes en inglés, etc.).
 */
export function normalizePrestadorStatus(value: unknown): PrestadorStatus {
  if (value != null && typeof value === "object" && "code" in (value as object)) {
    return normalizePrestadorStatus((value as { code: unknown }).code);
  }
  const raw =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : value != null
        ? String(value).trim().toLowerCase()
        : "";
  if (raw === "activo" || raw === "inactivo" || raw === "suspendido") {
    return raw;
  }
  if (raw === "active") return "activo";
  if (raw === "inactive") return "inactivo";
  if (raw === "suspended") return "suspendido";
  return "activo";
}

/** Elige el estado “más restrictivo” al fusionar varios registros por usuario. */
export function worsePrestadorStatus(
  a: PrestadorStatus | unknown,
  b: PrestadorStatus | unknown
): PrestadorStatus {
  const na = normalizePrestadorStatus(a);
  const nb = normalizePrestadorStatus(b);
  return STATUS_RANK[na] >= STATUS_RANK[nb] ? na : nb;
}

/**
 * Texto seguro para tablas (nunca `undefined` en pantalla).
 */
export function getPrestadorStatusLabel(
  status: PrestadorStatus | undefined
): string {
  if (status == null) return "—";
  const n = normalizePrestadorStatus(status);
  return PRESTADOR_STATUS_LABELS[n] ?? "—";
}
