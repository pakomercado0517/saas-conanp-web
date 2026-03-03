"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createActivo } from "../services/activos.api";
import type { CreateActivoPayload } from "../types";

const QUERY_KEY_PREFIX = ["activos"] as const;

export function useCreateActivo(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateActivoPayload) => {
      return createActivo(
        organizationId,
        payload,
        accessToken ?? undefined
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
    },
  });
}
