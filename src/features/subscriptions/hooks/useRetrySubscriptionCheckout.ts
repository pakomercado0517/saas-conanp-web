"use client";

import { useCallback, useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { persistCheckoutReturnContext } from "../lib/checkoutReturnStorage";
import { postSubscriptionCheckoutSession } from "../services/subscriptions.api";
import type { BillingCycle } from "../types";

export function useRetrySubscriptionCheckout(areaId: string) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = useCallback(
    async (args: {
      planId: string;
      billingCycle: BillingCycle;
      dependenciaId?: string | null;
    }) => {
      setError(null);
      setIsPending(true);
      try {
        persistCheckoutReturnContext(areaId, args.dependenciaId);
        const res = await postSubscriptionCheckoutSession(areaId, {
          planId: args.planId,
          billingCycle: args.billingCycle,
        });
        if (res.data?.url) {
          window.location.assign(res.data.url);
          return;
        }
        setError("No se recibió la URL de pago. Intenta de nuevo.");
      } catch (e) {
        setError(getApiErrorMessage(e));
      } finally {
        setIsPending(false);
      }
    },
    [areaId]
  );

  return { retry, isPending, error };
}
