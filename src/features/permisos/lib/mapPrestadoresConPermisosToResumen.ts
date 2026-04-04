import type { PrestadorConPermisosItem } from "@/features/prestadores/types";
import type { PermisoStatus, PrestadorPermisosResumen } from "../types";

const STATUSES: readonly PermisoStatus[] = [
  "activo",
  "inactivo",
  "vencido",
  "suspendido",
];

function parseStatus(raw: unknown): PermisoStatus {
  if (
    typeof raw === "string" &&
    STATUSES.includes(raw as PermisoStatus)
  ) {
    return raw as PermisoStatus;
  }
  return "inactivo";
}

/**
 * Convierte ítems del endpoint `GET .../prestadores/con-permisos` al resumen del índice del área.
 */
export function mapPrestadoresConPermisosItemsToResumen(
  items: PrestadorConPermisosItem[]
): PrestadorPermisosResumen[] {
  const rows: PrestadorPermisosResumen[] = [];

  for (const item of items) {
    const { prestador, permisos } = item;
    if (permisos.length === 0) continue;

    let activosCount = 0;
    let vigenciaHastaMax: string | null = null;

    for (const p of permisos) {
      if (parseStatus(p.status) === "activo") {
        activosCount += 1;
      }
      const hasta = p.validTo;
      if (typeof hasta === "string" && hasta.length > 0) {
        if (
          vigenciaHastaMax === null ||
          hasta > vigenciaHastaMax
        ) {
          vigenciaHastaMax = hasta;
        }
      }
    }

    const displayName =
      prestador.User?.name ??
      prestador.name ??
      prestador.id;
    const email = prestador.User?.email ?? prestador.email ?? undefined;

    const actividadLabels = new Set<string>();
    for (const p of permisos) {
      const label =
        p.Actividad?.name?.trim() ||
        (p.actividadId.length > 0 ? p.actividadId : "");
      if (label.length > 0) {
        actividadLabels.add(label);
      }
    }
    const actividadesResumen = [...actividadLabels].sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    ).join(", ");

    rows.push({
      prestadorId: prestador.id,
      displayName,
      email: email ?? undefined,
      totalPermisos: permisos.length,
      activosCount,
      vigenciaHastaMax,
      actividadesResumen,
    });
  }

  return rows;
}
