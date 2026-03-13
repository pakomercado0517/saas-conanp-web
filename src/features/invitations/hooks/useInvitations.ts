"use client";

import { useQuery } from "@tanstack/react-query";
import { listInvitations } from "../services/invitations.api";

const QUERY_KEY_PREFIX = ["invitations"] as const;

export interface UseInvitationsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export function useInvitations(
  organizationId: string,
  params: UseInvitationsParams = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () => listInvitations(organizationId, params),
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
