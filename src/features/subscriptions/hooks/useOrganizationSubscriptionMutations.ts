"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patchSubscriptionPlan,
  postOrganizationSubscription,
} from "../services/subscriptions.api";
import type {
  ChangeSubscriptionPlanPayload,
  CreateSubscriptionPayload,
} from "../types";
import { SUBSCRIPTION_PLANS_QUERY_KEY } from "./useSubscriptionPlans";

const QUERY_KEY_PREFIX = ["subscriptions", "current"] as const;

export function useOrganizationSubscriptionMutations(areaId: string) {
  const queryClient = useQueryClient();

  const invalidate = (): void => {
    void queryClient.invalidateQueries({
      queryKey: [...QUERY_KEY_PREFIX, areaId],
    });
    void queryClient.invalidateQueries({
      queryKey: SUBSCRIPTION_PLANS_QUERY_KEY,
    });
  };

  const createOrUpgrade = useMutation({
    mutationKey: ["subscriptions", "post", areaId],
    mutationFn: (payload: CreateSubscriptionPayload) =>
      postOrganizationSubscription(areaId, payload),
    onSuccess: invalidate,
  });

  const changePlan = useMutation({
    mutationKey: ["subscriptions", "patchPlan", areaId],
    mutationFn: (args: {
      subscriptionId: string;
      payload: ChangeSubscriptionPlanPayload;
    }) => patchSubscriptionPlan(args.subscriptionId, args.payload),
    onSuccess: invalidate,
  });

  return {
    createOrUpgrade: createOrUpgrade.mutateAsync,
    changePlan: changePlan.mutateAsync,
    isPending: createOrUpgrade.isPending || changePlan.isPending,
    isError: createOrUpgrade.isError || changePlan.isError,
    error: createOrUpgrade.error ?? changePlan.error,
  };
}
