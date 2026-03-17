"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPrestadorCompleto } from "../services/prestadores.api";
import type { CreatePrestadorCompletoPayload } from "../types";

const QUERY_KEY_PREFIX = ["prestadores"] as const;

export function useCreatePrestadorCompleto(organizationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...QUERY_KEY_PREFIX, "create-completo", organizationId],
    mutationFn: (payload: CreatePrestadorCompletoPayload) =>
      createPrestadorCompleto(organizationId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
    },
  });

  return {
    create: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
