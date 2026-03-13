"use client";

import { useQuery } from "@tanstack/react-query";
import { listMovimientos } from "../services/access-products.api";
import type { ListMovimientosParams, Movimiento } from "../types";

const QUERY_KEY_PREFIX = ["access-products", "movimientos"] as const;

export function useMovimientos(
  organizationId: string,
  productoId: string | null,
  params: ListMovimientosParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, productoId, params],
    queryFn: () =>
      listMovimientos(organizationId, productoId!, params),
    enabled: Boolean(organizationId && productoId),
  });

  return {
    data: query.data?.data as Movimiento[] | undefined,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
