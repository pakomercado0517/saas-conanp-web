"use client";

import { useQuery } from "@tanstack/react-query";
import { listMemberships } from "../services/memberships.api";
import type { ListMembershipsParams, Membership } from "../types";

const QUERY_KEY_PREFIX = ["memberships"] as const;

export function useMemberships(
  organizationId: string,
  params: ListMembershipsParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () => listMemberships(organizationId, params),
    enabled: Boolean(organizationId),
  });

  return {
    data: query.data?.data as Membership[] | undefined,
    pagination: query.data?.pagination,
    limits: query.data?.limits,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
