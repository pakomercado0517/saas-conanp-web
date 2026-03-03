"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listActividades } from "../services/actividades.api";
import type { ActividadItem } from "../services/actividades.api";

const QUERY_KEY_PREFIX = ["actividades"] as const;

export function useActividades(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId],
    queryFn: async () => {
      return listActividades(organizationId, accessToken ?? undefined);
    },
    enabled: Boolean(accessToken && organizationId),
  });

  return {
    data: query.data as ActividadItem[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
