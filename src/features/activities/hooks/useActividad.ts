"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getActividad } from "../services/activities.api";
import type { Actividad } from "../types";

const QUERY_KEY_PREFIX = ["actividad"] as const;

export function useActividad(
  organizationId: string,
  actividadId: string | null
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, actividadId],
    queryFn: async () => {
      if (!actividadId) return null;
      return getActividad(
        organizationId,
        actividadId,
        accessToken ?? undefined
      );
    },
    enabled: Boolean(accessToken && organizationId && actividadId),
  });

  return {
    data: query.data as Actividad | null | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
