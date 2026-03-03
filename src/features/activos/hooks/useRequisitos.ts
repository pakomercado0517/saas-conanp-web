"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listRequisitos } from "../services/requisitos.api";
import type { ActivoRequisito } from "../types";

const QUERY_KEY_PREFIX = ["requisitos"] as const;

export function useRequisitos(
  organizationId: string,
  activoId: string | null
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
    queryFn: async () => {
      if (!activoId) throw new Error("activoId required");
      return listRequisitos(
        organizationId,
        activoId,
        accessToken ?? undefined
      );
    },
    enabled: Boolean(accessToken && organizationId && activoId),
  });

  return {
    data: query.data as ActivoRequisito[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
