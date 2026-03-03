"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getSubscriptionPlans } from "../services/subscriptions.api";
import type { SubscriptionPlan } from "../types";

const QUERY_KEY = ["subscriptions", "plans"] as const;

export function useSubscriptionPlans() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await getSubscriptionPlans(accessToken ?? undefined);
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  return {
    plans: (query.data ?? []) as SubscriptionPlan[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
