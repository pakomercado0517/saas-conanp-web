"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listPermisos } from "../services/permisos.api";
import type { ListPermisosParams, Permiso } from "../types";

const QUERY_KEY_PREFIX = ["permisos"] as const;

export function usePermisos(
  organizationId: string,
  params: ListPermisosParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: async () => {
      const res = await listPermisos(
        organizationId,
        params,
        accessToken ?? undefined
      );
      return res;
    },
    enabled: Boolean(accessToken && organizationId),
  });

  return {
    data: query.data?.data as Permiso[] | undefined,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
