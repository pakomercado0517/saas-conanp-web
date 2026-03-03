"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listActivos } from "../services/activos.api";
import type { ListActivosParams, Activo } from "../types";

const QUERY_KEY_PREFIX = ["activos"] as const;

export function useActivos(
  organizationId: string,
  params: ListActivosParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: async () => {
      const res = await listActivos(
        organizationId,
        params,
        accessToken ?? undefined
      );
      return res;
    },
    enabled: Boolean(accessToken && organizationId),
  });

  return {
    data: query.data?.data as Activo[] | undefined,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
