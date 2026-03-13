"use client";

import { useQuery } from "@tanstack/react-query";
import { getReporteEventosPorPrestadorFecha } from "../services/reports.api";
import type {
  ReportesEventosPorPrestadorFechaParams,
  EventosPorPrestadorFechaItem,
} from "../services/reports.api";

const QUERY_KEY_PREFIX = ["reports", "eventos-por-prestador-fecha"] as const;

export function useReporteEventosPorPrestadorFecha(
  organizationId: string,
  params: ReportesEventosPorPrestadorFechaParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () =>
      getReporteEventosPorPrestadorFecha(organizationId, params),
    enabled: Boolean(organizationId),
  });

  return {
    data: query.data?.data as EventosPorPrestadorFechaItem[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
