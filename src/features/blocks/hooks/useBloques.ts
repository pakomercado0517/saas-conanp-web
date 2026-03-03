"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listBloques } from "../services/blocks.api";
import type { ListBloquesParams, Bloque } from "../types";

const QUERY_KEY_PREFIX = ["bloques"] as const;

export function useBloques(
  organizationId: string,
  actividadId: string | null,
  params: ListBloquesParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, actividadId, params],
    queryFn: async () => {
      if (!actividadId) return { data: [] };
      return listBloques(
        organizationId,
        actividadId,
        params,
        accessToken ?? undefined
      );
    },
    enabled: Boolean(accessToken && organizationId && actividadId),
  });

  return {
    data: query.data?.data as Bloque[] | undefined,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
