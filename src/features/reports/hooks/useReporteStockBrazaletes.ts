"use client";

import { useQuery } from "@tanstack/react-query";
import { getReporteStockBrazaletes } from "../services/reports.api";
import type {
  ReportesStockBrazaletesParams,
  StockBrazaletesItem,
} from "../services/reports.api";

const QUERY_KEY_PREFIX = ["reports", "stock-brazaletes"] as const;

export function useReporteStockBrazaletes(
  organizationId: string,
  params: ReportesStockBrazaletesParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () =>
      getReporteStockBrazaletes(organizationId, params),
    enabled: Boolean(organizationId),
  });

  return {
    data: query.data?.data as StockBrazaletesItem[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
