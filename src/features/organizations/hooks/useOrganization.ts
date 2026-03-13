"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrganization } from "../services/organizations.api";
import type { Organization } from "../types";

const QUERY_KEY_PREFIX = ["organization"] as const;

export function useOrganization(organizationId: string) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId],
    queryFn: async () => {
      const res = await getOrganization(organizationId);
      return res.data;
    },
    enabled: Boolean(organizationId),
    retry: (failureCount, error) => {
      const err = error as { statusCode?: number };
      if (err?.statusCode === 403 || err?.statusCode === 404) return false;
      return failureCount < 2;
    },
  });

  return {
    data: query.data as Organization | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    statusCode: (query.error as { statusCode?: number } | undefined)?.statusCode,
  };
}
