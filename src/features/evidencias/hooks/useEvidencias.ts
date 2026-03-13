"use client";

import { useQuery } from "@tanstack/react-query";
import { listEvidencias } from "../services/evidencias.api";
import type { Evidencia } from "../types";

const QUERY_KEY_PREFIX = ["evidencias"] as const;

export function useEvidencias(
  organizationId: string,
  eventoId: string | null
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, eventoId],
    queryFn: async () => {
      if (!eventoId) throw new Error("eventoId required");
      return listEvidencias(organizationId, eventoId);
    },
    enabled: Boolean(organizationId && eventoId),
  });

  return {
    data: query.data as Evidencia[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
