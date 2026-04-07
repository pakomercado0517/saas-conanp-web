"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patchSubscriptionPlan,
  postOrganizationSubscription,
  postSubscriptionCheckoutSession,
} from "../services/subscriptions.api";
import type {
  ChangeSubscriptionPlanPayload,
  CreateCheckoutSessionPayload,
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

  const startCheckout = useMutation({
    mutationKey: ["subscriptions", "checkoutSession", areaId],
    mutationFn: (payload: CreateCheckoutSessionPayload) =>
      postSubscriptionCheckoutSession(areaId, payload),
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
    startCheckout: startCheckout.mutateAsync,
    changePlan: changePlan.mutateAsync,
    isPending:
      createOrUpgrade.isPending ||
      startCheckout.isPending ||
      changePlan.isPending,
    isError:
      createOrUpgrade.isError || startCheckout.isError || changePlan.isError,
    error:
      createOrUpgrade.error ?? startCheckout.error ?? changePlan.error,
  };
}
