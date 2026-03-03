"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createPermiso } from "../services/permisos.api";
import type { CreatePermisoPayload } from "../types";

const QUERY_KEY_PREFIX = ["permisos"] as const;

export function useCreatePermiso(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePermisoPayload) => {
      return createPermiso(
        organizationId,
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
