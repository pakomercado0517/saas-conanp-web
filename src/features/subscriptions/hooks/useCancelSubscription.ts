"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postSubscriptionCancel } from "../services/subscriptions.api";
import type { CancelSubscriptionBody } from "../types";

const QUERY_KEY_PREFIX = ["subscriptions", "current"] as const;

export function useCancelSubscription(
  areaId: string,
  subscriptionId: string | undefined
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["subscriptions", "cancel", subscriptionId],
    mutationFn: (body: CancelSubscriptionBody) => {
      if (!subscriptionId) {
        return Promise.reject(new Error("Falta subscriptionId"));
      }
      return postSubscriptionCancel(subscriptionId, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, areaId],
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
