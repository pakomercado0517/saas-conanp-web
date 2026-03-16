"use client";

import { useQueries } from "@tanstack/react-query";
import { getCapacidadVerificar } from "../services/capacidad.api";
import type { CapacidadVerificarResponse } from "../types";

const QUERY_KEY_PREFIX = ["capacidad", "verificar"] as const;

/**
 * Obtiene la capacidad disponible por bloque para una actividad y fecha.
 * Ejecuta una petición por bloqueId en paralelo.
 */
export function useCapacidadPorBloques(
  organizationId: string,
  actividadId: string,
  date: string,
  bloqueIds: string[]
) {
  const queries = useQueries({
    queries: bloqueIds.map((bloqueId) => ({
      queryKey: [...QUERY_KEY_PREFIX, organizationId, actividadId, date, bloqueId],
      queryFn: () =>
        getCapacidadVerificar(organizationId, actividadId, { date, bloqueId }),
      enabled:
        Boolean(organizationId && actividadId && date && bloqueId) &&
        bloqueIds.length > 0,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error;

  const dataByBloqueId: Record<string, CapacidadVerificarResponse | undefined> = {};
  bloqueIds.forEach((id, i) => {
    dataByBloqueId[id] = queries[i]?.data;
  });

  return {
    dataByBloqueId,
    isLoading,
    isError,
    error,
    refetch: () => Promise.all(queries.map((q) => q.refetch())),
  };
}
