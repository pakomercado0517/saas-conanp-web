"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getPrestador } from "../services/prestadores.api";
import type { Prestador } from "../types";

/**
 * Resuelve en qué área existe el registro de prestador (mismo id puede no existir en otras ANP).
 */
export function useResolvePrestadorArea(
  areaIds: readonly string[],
  prestadorId: string,
  preferredAreaId: string | null
): {
  resolvedAreaId: string | null;
  prestador: Prestador | null;
  isLoading: boolean;
  isNotFound: boolean;
} {
  const idsToTry = useMemo(() => {
    const rest = areaIds.filter((id) => id !== preferredAreaId);
    if (preferredAreaId && areaIds.includes(preferredAreaId)) {
      return [preferredAreaId, ...rest];
    }
    return [...areaIds];
  }, [areaIds, preferredAreaId]);

  const queries = useQueries({
    queries: idsToTry.map((areaId) => ({
      queryKey: ["prestador", "resolve-area", areaId, prestadorId],
      queryFn: async () => {
        const res = await getPrestador(areaId, prestadorId);
        return res.data;
      },
      enabled: Boolean(areaId && prestadorId),
      retry: false,
    })),
  });

  let resolvedAreaId: string | null = null;
  let prestador: Prestador | null = null;
  for (let i = 0; i < idsToTry.length; i++) {
    const q = queries[i];
    if (q?.data) {
      resolvedAreaId = idsToTry[i];
      prestador = q.data;
      break;
    }
  }

  const isLoading = queries.some((q) => q.isLoading);
  const allSettled =
    idsToTry.length === 0 ||
    queries.every((q) => !q.isLoading && (q.isError || q.isSuccess));
  const isNotFound =
    idsToTry.length > 0 &&
    allSettled &&
    !prestador &&
    queries.every((q) => q.isError);

  return {
    resolvedAreaId,
    prestador,
    isLoading,
    isNotFound,
  };
}
