"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listMemberships } from "../services/memberships.api";
import type { MembershipRole } from "../types";

const QUERY_KEY_PREFIX = ["memberships"] as const;

export function useCurrentUserMembership(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, userId],
    queryFn: async () => {
      const res = await listMemberships(
        organizationId,
        { page: 1, limit: 100 },
        accessToken ?? undefined
      );
      return res.data;
    },
    enabled: Boolean(accessToken && organizationId && userId),
  });

  const currentMembership = query.data?.find((m) => m.User?.id === userId || m.userId === userId);
  const role: MembershipRole | null = currentMembership?.role ?? null;

  return {
    role,
    membership: currentMembership ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isAdmin: role === "admin",
  };
}
