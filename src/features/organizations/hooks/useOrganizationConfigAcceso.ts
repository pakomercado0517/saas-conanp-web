"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getConfigAcceso } from "../services/organizations.api";
import type { ConfigAccesoData } from "../types";

const QUERY_KEY_PREFIX = ["organization", "config-acceso"] as const;

export function useOrganizationConfigAcceso(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId],
    queryFn: async () => {
      const res = await getConfigAcceso(organizationId, accessToken ?? undefined);
      return res.data;
    },
    enabled: Boolean(accessToken && organizationId),
    retry: (failureCount, error) => {
      const err = error as { statusCode?: number };
      if (err?.statusCode === 403 || err?.statusCode === 404) return false;
      return failureCount < 2;
    },
  });

  const showProductosAcceso =
    query.data?.acceso?.brazaletesObligatorios === true;

  return {
    data: query.data as ConfigAccesoData | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    showProductosAcceso: Boolean(query.data && showProductosAcceso),
  };
}
