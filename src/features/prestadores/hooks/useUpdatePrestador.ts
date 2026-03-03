"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updatePrestador } from "../services/prestadores.api";
import type { UpdatePrestadorPayload } from "../types";

const QUERY_KEY_PREFIX = ["prestadores"] as const;

export function useUpdatePrestador(organizationId: string, prestadorId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...QUERY_KEY_PREFIX, "update", organizationId, prestadorId],
    mutationFn: (payload: UpdatePrestadorPayload) =>
      updatePrestador(organizationId, prestadorId, payload, accessToken ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, "detail", organizationId, prestadorId],
      });
    },
  });

  return {
    update: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
