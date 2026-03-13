"use client";

import { useQuery } from "@tanstack/react-query";
import { listDependenciaInvitations } from "../services/dependencias.api";
import type { ListDependenciaInvitationsParams } from "../types";

export const DEPENDENCIA_INVITATIONS_KEY = (depId: string) =>
  ["dependencias", depId, "invitations"] as const;

export function useDependenciaInvitations(
  dependenciaId: string,
  params: ListDependenciaInvitationsParams = {}
) {
  const query = useQuery({
    queryKey: [...DEPENDENCIA_INVITATIONS_KEY(dependenciaId), params],
    queryFn: () => listDependenciaInvitations(dependenciaId, params),
    enabled: Boolean(dependenciaId),
  });

  return {
    data: query.data?.data,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
