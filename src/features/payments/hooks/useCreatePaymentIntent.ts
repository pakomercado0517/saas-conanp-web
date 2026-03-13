"use client";

import { useMutation } from "@tanstack/react-query";
import { createPaymentIntent } from "../services/payments.api";

export function useCreatePaymentIntent(organizationId: string) {
  return useMutation({
    mutationFn: async (eventoId: string) => {
      return createPaymentIntent(organizationId, eventoId);
    },
  });
}
