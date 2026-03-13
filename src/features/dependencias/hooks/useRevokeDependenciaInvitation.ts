"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeDependenciaInvitation } from "../services/dependencias.api";
import { DEPENDENCIA_INVITATIONS_KEY } from "./useDependenciaInvitations";

export function useRevokeDependenciaInvitation(dependenciaId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (invitationId: string) =>
      revokeDependenciaInvitation(dependenciaId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DEPENDENCIA_INVITATIONS_KEY(dependenciaId),
      });
    },
  });

  return {
    revoke: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
