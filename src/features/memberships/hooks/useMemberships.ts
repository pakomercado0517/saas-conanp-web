"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listMemberships } from "../services/memberships.api";
import type { ListMembershipsParams, Membership } from "../types";

const QUERY_KEY_PREFIX = ["memberships"] as const;

export function useMemberships(
  organizationId: string,
  params: ListMembershipsParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () =>
      listMemberships(organizationId, params, accessToken ?? undefined),
    enabled: Boolean(accessToken && organizationId),
  });

  return {
    data: query.data?.data as Membership[] | undefined,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
