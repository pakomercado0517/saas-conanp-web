"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listProductosAcceso } from "../services/access-products.api";
import type { ListProductosAccesoParams } from "../services/access-products.api";

const QUERY_KEY_PREFIX = ["access-products"] as const;

export function useProductosAcceso(
  organizationId: string,
  params: ListProductosAccesoParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () =>
      listProductosAcceso(organizationId, params, accessToken ?? undefined),
    enabled: Boolean(accessToken && organizationId),
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
