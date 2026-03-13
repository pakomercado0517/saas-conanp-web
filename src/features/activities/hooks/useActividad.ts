"use client";

import { useQuery } from "@tanstack/react-query";
import { getActividad } from "../services/activities.api";
import type { Actividad } from "../types";

const QUERY_KEY_PREFIX = ["actividad"] as const;

export function useActividad(
  organizationId: string,
  actividadId: string | null
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, actividadId],
    queryFn: async () => {
      if (!actividadId) return null;
      return getActividad(organizationId, actividadId);
    },
    enabled: Boolean(organizationId && actividadId),
  });

  return {
    data: query.data as Actividad | null | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
