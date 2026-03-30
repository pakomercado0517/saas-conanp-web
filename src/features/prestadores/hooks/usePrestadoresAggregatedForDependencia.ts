"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { listPrestadores } from "../services/prestadores.api";
import type { DependenciaArea } from "@/features/dependencias/types";
import { aggregatePrestadoresForDependencia } from "../lib/aggregate-prestadores-for-dependencia";
import type { Prestador } from "../types";

export const PRESTADORES_DEPENDENCIA_QUERY_KEY = [
  "prestadores-dependencia",
] as const;

export function usePrestadoresAggregatedForDependencia(
  dependenciaId: string,
  areas: DependenciaArea[]
) {
  const areaIds = useMemo(() => areas.map((a) => a.id), [areas]);

  const queries = useQueries({
    queries: areaIds.map((areaId) => ({
      queryKey: [...PRESTADORES_DEPENDENCIA_QUERY_KEY, dependenciaId, areaId],
      queryFn: async () => {
        const res = await listPrestadores(areaId, { limit: 100 });
        return res.data;
      },
      enabled: Boolean(dependenciaId && areaId),
    })),
  });

  const prestadoresByAreaId = useMemo(() => {
    const map = new Map<string, Prestador[]>();
    areaIds.forEach((areaId, index) => {
      map.set(areaId, queries[index]?.data ?? []);
    });
    return map;
  }, [areaIds, queries]);

  const aggregated = useMemo(
    () => aggregatePrestadoresForDependencia(areas, prestadoresByAreaId),
    [areas, prestadoresByAreaId]
  );

  const isLoading = queries.some((q) => q.isLoading);
  const errors = queries.map((q) => q.error).filter(Boolean);
  const refetch = () => {
    void Promise.all(queries.map((q) => q.refetch()));
  };

  return {
    aggregated,
    prestadoresByAreaId,
    isLoading,
    errors,
    refetch,
  };
}
