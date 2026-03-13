"use client";

import { useQuery } from "@tanstack/react-query";
import { getPrestador } from "../services/prestadores.api";
import type { Prestador } from "../types";

const QUERY_KEY_PREFIX = ["prestadores", "detail"] as const;

export function usePrestador(organizationId: string, prestadorId: string | null) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, prestadorId],
    queryFn: async () => {
      if (!prestadorId) return null;
      const res = await getPrestador(organizationId, prestadorId);
      return res.data;
    },
    enabled: Boolean(organizationId && prestadorId),
    retry: (failureCount, error) => {
      const err = error as { statusCode?: number };
      if (err?.statusCode === 403 || err?.statusCode === 404) return false;
      return failureCount < 2;
    },
  });

  return {
    data: query.data as Prestador | null | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    statusCode: (query.error as { statusCode?: number } | undefined)?.statusCode,
  };
}
