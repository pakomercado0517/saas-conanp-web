"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelSubscriptionAtPeriodEnd } from "../services/subscriptions.api";

const QUERY_KEY_PREFIX = ["subscriptions", "current"] as const;

export function useCancelSubscription(organizationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["subscriptions", "cancel", organizationId],
    mutationFn: () => cancelSubscriptionAtPeriodEnd(organizationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
    },
  });

  return {
    cancel: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
