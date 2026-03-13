"use client";

import { useQuery } from "@tanstack/react-query";
import { listPermisos } from "../services/permisos.api";
import type { ListPermisosParams, Permiso } from "../types";

const QUERY_KEY_PREFIX = ["permisos"] as const;

export function usePermisos(
  organizationId: string,
  params: ListPermisosParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: async () => {
      const res = await listPermisos(organizationId, params);
      return res;
    },
    enabled: Boolean(organizationId),
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
