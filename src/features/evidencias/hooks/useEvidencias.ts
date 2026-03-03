"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listEvidencias } from "../services/evidencias.api";
import type { Evidencia } from "../types";

const QUERY_KEY_PREFIX = ["evidencias"] as const;

export function useEvidencias(
  organizationId: string,
  eventoId: string | null
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, eventoId],
    queryFn: async () => {
      if (!eventoId) throw new Error("eventoId required");
      return listEvidencias(
        organizationId,
        eventoId,
        accessToken ?? undefined
      );
    },
    enabled: Boolean(accessToken && organizationId && eventoId),
  });

  return {
    data: query.data as Evidencia[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
