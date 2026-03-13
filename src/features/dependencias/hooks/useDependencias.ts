"use client";

import { useQuery } from "@tanstack/react-query";
import { listDependencias } from "../services/dependencias.api";
import type { ListDependenciasParams } from "../types";

export const DEPENDENCIAS_QUERY_KEY = ["dependencias"] as const;

export function useDependencias(params: ListDependenciasParams = {}) {
  const query = useQuery({
    queryKey: [...DEPENDENCIAS_QUERY_KEY, params],
    queryFn: () => listDependencias(params),
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
