"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getReporteCapacidadUtilizada } from "../services/reports.api";
import type {
  ReportesCapacidadUtilizadaParams,
  CapacidadUtilizadaItem,
} from "../services/reports.api";

const QUERY_KEY_PREFIX = ["reports", "capacidad-utilizada"] as const;

export function useReporteCapacidadUtilizada(
  organizationId: string,
  params: ReportesCapacidadUtilizadaParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () =>
      getReporteCapacidadUtilizada(organizationId, params, accessToken ?? undefined),
    enabled: Boolean(accessToken && organizationId),
  });

  return {
    data: query.data?.data as CapacidadUtilizadaItem[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
