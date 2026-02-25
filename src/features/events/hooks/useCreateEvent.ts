"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createEvento } from "../services/events.api";
import type { CreateEventoPayload, EventoOperativo } from "../types";

const QUERY_KEY_PREFIX = ["events"] as const;

export function useCreateEvent(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...QUERY_KEY_PREFIX, "create", organizationId],
    mutationFn: (payload: CreateEventoPayload) =>
      createEvento(organizationId, payload, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PREFIX, organizationId] });
    },
  });

  return {
    create: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  } as {
    create: (payload: CreateEventoPayload) => Promise<EventoOperativo>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
}
