"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deletePermiso } from "../services/permisos.api";

const QUERY_KEY_PREFIX = ["permisos"] as const;

export function useDeletePermiso(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permisoId: string) => {
      return deletePermiso(
        organizationId,
        permisoId,
        accessToken ?? undefined
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
    },
  });
}
