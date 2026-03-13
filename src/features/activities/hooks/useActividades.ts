"use client";

import { useQuery } from "@tanstack/react-query";
import { listActividades } from "../services/activities.api";
import type { ListActividadesParams, Actividad } from "../types";

const QUERY_KEY_PREFIX = ["activities"] as const;

export function useActividades(
  organizationId: string,
  params: ListActividadesParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: async () => {
      return listActividades(organizationId, params);
    },
    enabled: Boolean(organizationId),
  });

  return {
    data: query.data?.data as Actividad[] | undefined,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
