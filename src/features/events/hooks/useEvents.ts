"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listEventos } from "../services/events.api";
import type { EventoOperativo, ListEventosParams } from "../types";

const QUERY_KEY_PREFIX = ["events"] as const;

export function useEvents(
  organizationId: string,
  params: ListEventosParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, params],
    queryFn: () => listEventos(organizationId, params, accessToken ?? undefined),
    enabled: Boolean(accessToken && organizationId),
  });

  return {
    data: query.data?.data as EventoOperativo[] | undefined,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
