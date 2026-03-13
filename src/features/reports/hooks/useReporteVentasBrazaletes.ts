"use client";

import { useQuery } from "@tanstack/react-query";
import { getReporteVentasBrazaletes } from "../services/reports.api";
import type {
  ReportesVentasBrazaletesParams,
  VentasBrazaletesItem,
} from "../services/reports.api";

const QUERY_KEY_PREFIX = ["reports", "ventas-brazaletes"] as const;

export function useReporteVentasBrazaletes(
  organizationId: string,
  params: ReportesVentasBrazaletesParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () =>
      getReporteVentasBrazaletes(organizationId, params),
    enabled: Boolean(organizationId),
  });

  return {
    data: query.data?.data as VentasBrazaletesItem[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
