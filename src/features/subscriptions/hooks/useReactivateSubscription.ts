"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postSubscriptionReactivate } from "../services/subscriptions.api";

const QUERY_KEY_PREFIX = ["subscriptions", "current"] as const;

export function useReactivateSubscription(
  areaId: string,
  subscriptionId: string | undefined
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["subscriptions", "reactivate", subscriptionId],
    mutationFn: () => {
      if (!subscriptionId) {
        return Promise.reject(new Error("Falta subscriptionId"));
      }
      return postSubscriptionReactivate(subscriptionId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, areaId],
      });
    },
  });

  return {
    reactivate: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
