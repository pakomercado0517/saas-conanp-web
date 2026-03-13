"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubscriptionPlans } from "../services/subscriptions.api";
import type { SubscriptionPlan } from "../types";

const QUERY_KEY = ["subscriptions", "plans"] as const;

export function useSubscriptionPlans() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await getSubscriptionPlans();
      return res.data;
    },
    enabled: true,
  });

  return {
    plans: (query.data ?? []) as SubscriptionPlan[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
