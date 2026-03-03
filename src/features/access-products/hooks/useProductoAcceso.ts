"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getProductoAcceso } from "../services/access-products.api";
import type { ProductoAcceso } from "../types";

const QUERY_KEY_PREFIX = ["access-products", "producto"] as const;

export function useProductoAcceso(organizationId: string, productoId: string | null) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, productoId],
    queryFn: () =>
      getProductoAcceso(organizationId, productoId!, accessToken ?? undefined),
    enabled: Boolean(accessToken && organizationId && productoId),
  });

  return {
    data: query.data?.data as ProductoAcceso | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
