"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getDependencia } from "../services/dependencias.api";
import type { Dependencia } from "../types";

export function useDependencia(dependenciaId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: ["dependencias", dependenciaId],
    queryFn: async () => {
      const res = await getDependencia(dependenciaId, accessToken ?? undefined);
      return res.data;
    },
    enabled: Boolean(accessToken && dependenciaId),
    retry: (failureCount, error) => {
      const err = error as { statusCode?: number };
      if (err?.statusCode === 403 || err?.statusCode === 404) return false;
      return failureCount < 2;
    },
  });

  return {
    data: query.data as Dependencia | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
