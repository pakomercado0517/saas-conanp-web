"use client";

import { useQuery } from "@tanstack/react-query";
import { listProductosAcceso } from "../services/access-products.api";
import type { ListProductosAccesoParams } from "../services/access-products.api";

const QUERY_KEY_PREFIX = ["access-products"] as const;

export function useProductosAcceso(
  organizationId: string,
  params: ListProductosAccesoParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () => listProductosAcceso(organizationId, params),
    enabled: Boolean(organizationId),
  });

  return {
    data: query.data?.data,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
