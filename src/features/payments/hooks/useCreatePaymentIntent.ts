"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createPaymentIntent } from "../services/payments.api";

export function useCreatePaymentIntent(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMutation({
    mutationFn: async (eventoId: string) => {
      return createPaymentIntent(
        organizationId,
        eventoId,
        accessToken ?? undefined
      );
    },
  });
}
