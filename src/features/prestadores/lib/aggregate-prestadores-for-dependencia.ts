import type { DependenciaArea } from "@/features/dependencias/types";
import type { Prestador, PrestadorStatus } from "../types";
import {
  normalizePrestadorStatus,
  worsePrestadorStatus,
} from "./prestador-status";

export interface PrestadorAreaEntry {
  areaId: string;
  areaName: string;
  prestadorId: string;
  organizationId: string;
}

/** Fila deduplicada por usuario (mismo prestador puede existir en varias ANP). */
export interface AggregatedPrestadorRow {
  userId: string;
  name: string;
  email: string;
  status: PrestadorStatus;
  entries: PrestadorAreaEntry[];
}

function pickDisplayName(p: Prestador): string {
  return (
    p.name?.trim() ||
    p.User?.name?.trim() ||
    p.email?.trim() ||
    p.userId
  );
}

function pickEmail(p: Prestador): string {
  return p.email?.trim() || p.User?.email?.trim() || "—";
}

export function aggregatePrestadoresForDependencia(
  areas: DependenciaArea[],
  prestadoresByAreaId: Map<string, Prestador[]>
): AggregatedPrestadorRow[] {
  const byUser = new Map<string, AggregatedPrestadorRow>();

  for (const area of areas) {
    const list = prestadoresByAreaId.get(area.id) ?? [];
    for (const p of list) {
      const uid = p.userId;
      let row = byUser.get(uid);
      if (!row) {
        row = {
          userId: uid,
          name: pickDisplayName(p),
          email: pickEmail(p),
          status: normalizePrestadorStatus(p.status),
          entries: [],
        };
        byUser.set(uid, row);
      } else {
        row.status = worsePrestadorStatus(row.status, p.status);
        if (pickDisplayName(p) !== "—") row.name = pickDisplayName(p);
        if (pickEmail(p) !== "—") row.email = pickEmail(p);
      }
      row.entries.push({
        areaId: area.id,
        areaName: area.name,
        prestadorId: p.id,
        organizationId: p.organizationId,
      });
    }
  }

  for (const row of byUser.values()) {
    row.entries.sort((a, b) => a.areaName.localeCompare(b.areaName, "es"));
  }

  return Array.from(byUser.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es")
  );
}
