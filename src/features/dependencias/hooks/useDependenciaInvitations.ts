"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listDependenciaInvitations } from "../services/dependencias.api";
import type { ListDependenciaInvitationsParams } from "../types";

export const DEPENDENCIA_INVITATIONS_KEY = (depId: string) =>
  ["dependencias", depId, "invitations"] as const;

export function useDependenciaInvitations(
  dependenciaId: string,
  params: ListDependenciaInvitationsParams = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...DEPENDENCIA_INVITATIONS_KEY(dependenciaId), params],
    queryFn: () =>
      listDependenciaInvitations(
        dependenciaId,
        params,
        accessToken ?? undefined
      ),
    enabled: Boolean(accessToken && dependenciaId),
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
