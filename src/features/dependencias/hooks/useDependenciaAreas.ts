"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listDependenciaAreas } from "../services/dependencias.api";
import type { ListDependenciaAreasParams } from "../types";

export const DEPENDENCIA_AREAS_KEY = (depId: string) =>
  ["dependencias", depId, "areas"] as const;

export function useDependenciaAreas(
  dependenciaId: string,
  params: ListDependenciaAreasParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...DEPENDENCIA_AREAS_KEY(dependenciaId), params],
    queryFn: () =>
      listDependenciaAreas(dependenciaId, params, accessToken ?? undefined),
    enabled: Boolean(accessToken && dependenciaId),
  });

  return {
    data: query.data?.data,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
