"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateActivo } from "../services/activos.api";
import type { UpdateActivoPayload } from "../types";

const QUERY_KEY_PREFIX = ["activos"] as const;

export function useUpdateActivo(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      activoId,
      payload,
    }: { activoId: string; payload: UpdateActivoPayload }) => {
      return updateActivo(
        organizationId,
        activoId,
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
