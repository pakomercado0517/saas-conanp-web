"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listPrestadores } from "../services/prestadores.api";
import type { ListPrestadoresParams, Prestador } from "../types";

const QUERY_KEY_PREFIX = ["prestadores"] as const;

export function usePrestadores(
  organizationId: string,
  params: ListPrestadoresParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: async () => {
      const res = await listPrestadores(
        organizationId,
        params,
        accessToken ?? undefined
      );
      return res;
    },
    enabled: Boolean(accessToken && organizationId),
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
