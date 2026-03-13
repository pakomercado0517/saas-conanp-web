"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subscribeOrChangePlan } from "../services/subscriptions.api";
import type { SubscribeOrChangePlanPayload } from "../types";

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
    },
  });

  return {
    subscribe: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
