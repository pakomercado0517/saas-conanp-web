"use client";

import { useQuery } from "@tanstack/react-query";
import { listPrestadores } from "../services/prestadores.api";
import type { ListPrestadoresParams, Prestador } from "../types";

const QUERY_KEY_PREFIX = ["prestadores"] as const;

export function usePrestadores(
  organizationId: string,
  params: ListPrestadoresParams = {},
  options?: { enabled?: boolean }
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: async () => {
      const res = await listPrestadores(organizationId, params);
      return res;
    },
    enabled:
      Boolean(organizationId) && (options?.enabled !== false),
  });

  return {
    data: query.data?.data as Prestador[] | undefined,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
