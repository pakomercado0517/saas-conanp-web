"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cancelSubscriptionAtPeriodEnd } from "../services/subscriptions.api";

const QUERY_KEY_PREFIX = ["subscriptions", "current"] as const;

export function useCancelSubscription(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["subscriptions", "cancel", organizationId],
    mutationFn: () =>
      cancelSubscriptionAtPeriodEnd(organizationId, accessToken ?? undefined),
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
