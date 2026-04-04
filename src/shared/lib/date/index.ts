import { parse, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

/**
 * Resuelve la zona horaria del navegador; en SSR devuelve UTC.
 */
export function getDefaultTimeZone(): string {
  if (typeof Intl === "undefined") return "UTC";
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Parsea una fecha ISO 8601 en UTC recibida desde la API.
 */
export function fromApiUtc(iso: string): Date {
  return parseISO(iso);
}

export interface FormatDateOptions {
  timeZone?: string;
}

/** Patrón de fecha solo calendario devuelta por la API (sin componente horario de negocio). */
const CALENDAR_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Formatea una fecha civil `YYYY-MM-DD` tal como viene de la API (p. ej. eventos).
 * No usa `new Date("YYYY-MM-DD")` + formato local: ese string es medianoche UTC y en
 * zonas como México el día mostrado puede retroceder uno. Aquí el día/mes/año del
 * string se interpretan como calendario y se formatean en UTC para conservar esas partes.
 */
export function formatCalendarDateOnlyFromApi(dateOnly: string): string {
  if (!dateOnly) return "";
  const m = CALENDAR_DATE_ONLY.exec(dateOnly.trim());
  if (!m) return dateOnly;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(mo) ||
    !Number.isFinite(d) ||
    mo < 1 ||
    mo > 12 ||
    d < 1 ||
    d > 31
  ) {
    return dateOnly;
  }
  const utcMidnight = new Date(Date.UTC(y, mo - 1, d));
  return formatInTimeZone(utcMidnight, "UTC", "d MMM yyyy", { locale: es });
}

/**
 * Formato de fecha para UI (solo día) según zona horaria.
 */
export function formatDate(iso: string, options?: FormatDateOptions): string {
  if (!iso) return "";
  const tz = options?.timeZone ?? getDefaultTimeZone();
  return formatInTimeZone(parseISO(iso), tz, "d MMM yyyy", {
    locale: es,
  });
}

/**
 * Formato de fecha y hora para UI según zona horaria.
 */
export function formatDateTime(iso: string, options?: FormatDateOptions): string {
  if (!iso) return "";
  const tz = options?.timeZone ?? getDefaultTimeZone();
  return formatInTimeZone(parseISO(iso), tz, "d MMM yyyy, HH:mm", {
    locale: es,
  });
}

/**
 * Convierte un valor de input `type="date"` (yyyy-MM-dd) a ISO UTC,
 * interpretando inicio o fin de día en la zona indicada.
 */
export function toApiUtcFromDateInput(
  dateStr: string,
  timeZone: string,
  boundary: "start" | "end"
): string {
  const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
  const withTime = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
    boundary === "end" ? 23 : 0,
    boundary === "end" ? 59 : 0,
    boundary === "end" ? 59 : 0,
    boundary === "end" ? 999 : 0
  );
  return fromZonedTime(withTime, timeZone).toISOString();
}

/**
 * Convierte ISO UTC a yyyy-MM-dd para inputs de fecha en la zona del usuario.
 */
export function formatIsoToDateInput(iso: string, timeZone: string): string {
  if (!iso) return "";
  return formatInTimeZone(parseISO(iso), timeZone, "yyyy-MM-dd");
}
