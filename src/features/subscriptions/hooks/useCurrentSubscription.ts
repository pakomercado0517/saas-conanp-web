"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getCurrentSubscription } from "../services/subscriptions.api";
import type { Subscription } from "../types";

const QUERY_KEY_PREFIX = ["subscriptions", "current"] as const;

export type CurrentSubscriptionState =
  | { status: "loading" }
  | { status: "forbidden" }
  | { status: "ready"; subscription: Subscription | null };

export function useCurrentSubscription(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId],
    queryFn: async () => {
      const res = await getCurrentSubscription(organizationId, accessToken ?? undefined);
      return res.data;
    },
    enabled: Boolean(accessToken && organizationId),
    retry: (failureCount, error) => {
      const err = error as { statusCode?: number };
      if (err?.statusCode === 403) return false;
      return failureCount < 2;
    },
  });

  const isForbidden = query.isError && (query.error as { statusCode?: number })?.statusCode === 403;

  const state: CurrentSubscriptionState =
    query.isLoading && query.fetchStatus !== "idle"
      ? { status: "loading" }
      : isForbidden
        ? { status: "forbidden" }
        : { status: "ready", subscription: query.data ?? null };

  const isActive =
    state.status === "ready" &&
    state.subscription != null &&
    (state.subscription.status === "active" || state.subscription.status === "trialing");

  return {
    state,
    subscription: state.status === "ready" ? state.subscription : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isActive,
  };
}
