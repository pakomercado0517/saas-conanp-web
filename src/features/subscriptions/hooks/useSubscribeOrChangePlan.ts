"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subscribeOrChangePlan } from "../services/subscriptions.api";
import type { SubscribeOrChangePlanPayload } from "../types";
import { SUBSCRIPTION_PLANS_QUERY_KEY } from "./useSubscriptionPlans";

const QUERY_KEY_PREFIX = ["subscriptions", "current"] as const;

export function useSubscribeOrChangePlan(organizationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["subscriptions", "subscribe", organizationId],
    mutationFn: (payload: SubscribeOrChangePlanPayload) =>
      subscribeOrChangePlan(organizationId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
      void queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_PLANS_QUERY_KEY,
      });
    },
  });

  return {
    subscribe: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
