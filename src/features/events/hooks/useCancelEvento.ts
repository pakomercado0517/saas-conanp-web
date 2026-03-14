"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelEvento } from "../services/events.api";
import type { EventoOperativo } from "../types";

const QUERY_KEY_PREFIX = ["events"] as const;

export function useCancelEvento(organizationId: string, eventoId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...QUERY_KEY_PREFIX, "cancel", organizationId, eventoId],
    mutationFn: () => cancelEvento(organizationId, eventoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, eventoId],
      });
    },
  });

  return {
    cancel: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  } as {
    cancel: () => Promise<EventoOperativo>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
}
