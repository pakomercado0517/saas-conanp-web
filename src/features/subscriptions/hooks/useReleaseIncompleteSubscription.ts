"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postSubscriptionReleaseIncomplete } from "../services/subscriptions.api";

const CURRENT_KEY_PREFIX = ["subscriptions", "current"] as const;

export function useReleaseIncompleteSubscription(
  areaId: string,
  subscriptionId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["subscriptions", "releaseIncomplete", subscriptionId],
    mutationFn: () => postSubscriptionReleaseIncomplete(subscriptionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...CURRENT_KEY_PREFIX, areaId],
      });
    },
  });
}
