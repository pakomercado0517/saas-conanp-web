"use client";

import { useQuery } from "@tanstack/react-query";
import { getActivo } from "../services/activos.api";
import type { Activo } from "../types";

const QUERY_KEY_PREFIX = ["activo"] as const;

export function useActivo(
  organizationId: string,
  activoId: string | null
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
    queryFn: async () => {
      if (!activoId) throw new Error("activoId required");
      const res = await getActivo(organizationId, activoId);
      return res.data;
    },
    enabled: Boolean(organizationId && activoId),
  });

  return {
    data: query.data as Activo | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
