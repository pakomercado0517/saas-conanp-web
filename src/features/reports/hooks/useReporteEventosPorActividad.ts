"use client";

import { useQuery } from "@tanstack/react-query";
import { getReporteEventosPorActividad } from "../services/reports.api";
import type { ReportesEventosPorActividadParams } from "../services/reports.api";

const QUERY_KEY_PREFIX = ["reports", "eventos-por-actividad"] as const;

export function useReporteEventosPorActividad(
  organizationId: string,
  params: ReportesEventosPorActividadParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () =>
      getReporteEventosPorActividad(organizationId, params),
    enabled: Boolean(organizationId),
  });

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
