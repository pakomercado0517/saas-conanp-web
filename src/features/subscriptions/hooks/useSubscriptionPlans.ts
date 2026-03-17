"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubscriptionPlansCatalog } from "../services/subscriptions.api";
import type { SubscriptionPlan } from "../types";

/** Query key del catálogo de planes; usar para invalidateQueries/refetchQueries */
export const SUBSCRIPTION_PLANS_QUERY_KEY = ["subscriptions", "plans"] as const;

/** Tiempo en ms durante el cual el catálogo se considera fresco (evita refetch innecesario) */
const PLANS_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutos

export function useSubscriptionPlans() {
  const query = useQuery({
    queryKey: SUBSCRIPTION_PLANS_QUERY_KEY,
    queryFn: getSubscriptionPlansCatalog,
    enabled: true,
    staleTime: PLANS_STALE_TIME_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    plans: (query.data ?? []) as SubscriptionPlan[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
