"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePermiso } from "../services/permisos.api";

const QUERY_KEY_PREFIX = ["permisos"] as const;

export function useDeletePermiso(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permisoId: string) => {
      return deletePermiso(organizationId, permisoId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
    },
  });
}
