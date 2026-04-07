"use client";

import { useCallback, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { prestadorActivosOwnedQueryKey } from "@/features/activos/constants/prestadorActivosQueryKeys";
import { listActivosOwnedByPrestador } from "@/features/activos/services/activos.api";
import type { AggregatedPrestadorRow } from "../lib/aggregate-prestadores-for-dependencia";

export interface PrestadorActivosCountSummary {
  total: number;
  isLoading: boolean;
}

/**
 * Cuenta activos por prestador a nivel de dependencia: el listado por ANP devuelve
 * el mismo conjunto lógico de activos (alcance dependencia), así que no se suman
 * filas por cada ANP — se usa una entrada representativa (misma query que el detalle).
 *
 * @param activosCountScopeAreaId Si no está vacío, solo se considera el par de esa ANP (vista filtrada).
 */
export function usePrestadoresActivosCountsForAggregated(
  aggregated: AggregatedPrestadorRow[],
  activosCountScopeAreaId = ""
) {
  const uniquePairs = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ areaId: string; prestadorId: string }> = [];
    for (const row of aggregated) {
      for (const e of row.entries) {
        const k = `${e.areaId}:${e.prestadorId}`;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ areaId: e.areaId, prestadorId: e.prestadorId });
      }
    }
    return out;
  }, [aggregated]);

  const queries = useQueries({
    queries: uniquePairs.map((p) => ({
      queryKey: prestadorActivosOwnedQueryKey(p.areaId, p.prestadorId),
      queryFn: () => listActivosOwnedByPrestador(p.areaId, p.prestadorId),
      enabled: uniquePairs.length > 0,
    })),
  });

  const countByPairKey = useMemo(() => {
    const m = new Map<string, number>();
    uniquePairs.forEach((p, i) => {
      const data = queries[i]?.data;
      m.set(`${p.areaId}:${p.prestadorId}`, Array.isArray(data) ? data.length : 0);
    });
    return m;
  }, [uniquePairs, queries]);

  const loadingByPairKey = useMemo(() => {
    const m = new Map<string, boolean>();
    uniquePairs.forEach((p, i) => {
      m.set(`${p.areaId}:${p.prestadorId}`, Boolean(queries[i]?.isLoading));
    });
    return m;
  }, [uniquePairs, queries]);

  const summaryForRow = useCallback(
    (row: AggregatedPrestadorRow): PrestadorActivosCountSummary => {
      const entries =
        activosCountScopeAreaId === ""
          ? row.entries
          : row.entries.filter((e) => e.areaId === activosCountScopeAreaId);
      if (entries.length === 0) {
        return { total: 0, isLoading: false };
      }
      const representative = entries[0]!;
      const k = `${representative.areaId}:${representative.prestadorId}`;
      return {
        total: countByPairKey.get(k) ?? 0,
        isLoading: Boolean(loadingByPairKey.get(k)),
      };
    },
    [countByPairKey, loadingByPairKey, activosCountScopeAreaId]
  );

  return { summaryForRow };
}
