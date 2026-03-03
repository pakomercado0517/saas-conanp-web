"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updatePermiso } from "../services/permisos.api";
import type { UpdatePermisoPayload } from "../types";

const QUERY_KEY_PREFIX = ["permisos"] as const;

export function useUpdatePermiso(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      permisoId,
      payload,
    }: { permisoId: string; payload: UpdatePermisoPayload }) => {
      return updatePermiso(
        organizationId,
        permisoId,
        payload,
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
