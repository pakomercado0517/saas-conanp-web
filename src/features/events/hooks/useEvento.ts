"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvento } from "../services/events.api";
import type { EventoOperativo } from "../types";

const QUERY_KEY_PREFIX = ["events"] as const;

export function useEvento(organizationId: string, eventoId: string | null) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, eventoId],
    queryFn: () => getEvento(organizationId, eventoId!),
    enabled: Boolean(organizationId && eventoId),
  });

  return {
    data: query.data as EventoOperativo | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
