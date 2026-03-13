"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivateSubscription } from "../services/subscriptions.api";

const QUERY_KEY_PREFIX = ["subscriptions", "current"] as const;

export function useReactivateSubscription(organizationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["subscriptions", "reactivate", organizationId],
    mutationFn: () => reactivateSubscription(organizationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
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
