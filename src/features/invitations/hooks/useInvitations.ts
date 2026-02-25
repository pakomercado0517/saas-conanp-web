"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
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
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () =>
      listInvitations(organizationId, params, accessToken ?? undefined),
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
