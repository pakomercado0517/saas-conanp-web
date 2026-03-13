"use client";

import { useQuery } from "@tanstack/react-query";
import { getReportePrestadoresActivos } from "../services/reports.api";
import type { PrestadorActivoItem } from "../services/reports.api";

const QUERY_KEY_PREFIX = ["reports", "prestadores-activos"] as const;

export function useReportePrestadoresActivos(organizationId: string) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId],
    queryFn: () =>
      getReportePrestadoresActivos(organizationId),
    enabled: Boolean(organizationId),
  });

  return {
    data: query.data?.data as PrestadorActivoItem[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
