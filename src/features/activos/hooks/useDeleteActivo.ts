"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteActivo } from "../services/activos.api";

const QUERY_KEY_PREFIX = ["activos"] as const;

export function useDeleteActivo(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activoId: string) => {
      return deleteActivo(
        organizationId,
        activoId,
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
