"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createDependenciaInvitation } from "../services/dependencias.api";
import { DEPENDENCIA_INVITATIONS_KEY } from "./useDependenciaInvitations";
import type {
  CreateDependenciaInvitationPayload,
  DependenciaInvitation,
} from "../types";

export function useCreateDependenciaInvitation(dependenciaId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateDependenciaInvitationPayload) =>
      createDependenciaInvitation(
        dependenciaId,
        payload,
        accessToken ?? undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DEPENDENCIA_INVITATIONS_KEY(dependenciaId),
      });
    },
  });

  return {
    create: mutation.mutateAsync as (
      payload: CreateDependenciaInvitationPayload
    ) => Promise<{ success: true; data: DependenciaInvitation; message?: string }>,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
