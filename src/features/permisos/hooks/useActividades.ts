"use client";

import { useQuery } from "@tanstack/react-query";
import { listActividades } from "../services/actividades.api";
import type { ActividadItem } from "../services/actividades.api";

const QUERY_KEY_PREFIX = ["actividades"] as const;

export function useActividades(organizationId: string) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId],
    queryFn: async () => {
      return listActividades(organizationId);
    },
    enabled: Boolean(organizationId),
  });

  return {
    data: query.data as ActividadItem[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
