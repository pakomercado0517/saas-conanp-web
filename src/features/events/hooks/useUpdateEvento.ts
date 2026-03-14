"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEvento } from "../services/events.api";
import type { EventoOperativo, UpdateEventoPayload } from "../types";

const QUERY_KEY_PREFIX = ["events"] as const;

export function useUpdateEvento(organizationId: string, eventoId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...QUERY_KEY_PREFIX, "update", organizationId, eventoId],
    mutationFn: (payload: UpdateEventoPayload) =>
      updateEvento(organizationId, eventoId, payload),
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
    update: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  } as {
    update: (payload: UpdateEventoPayload) => Promise<EventoOperativo>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
}
