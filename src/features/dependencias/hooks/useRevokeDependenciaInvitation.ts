"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { revokeDependenciaInvitation } from "../services/dependencias.api";
import { DEPENDENCIA_INVITATIONS_KEY } from "./useDependenciaInvitations";

export function useRevokeDependenciaInvitation(dependenciaId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (invitationId: string) =>
      revokeDependenciaInvitation(
        dependenciaId,
        invitationId,
        accessToken ?? undefined
      ),
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
