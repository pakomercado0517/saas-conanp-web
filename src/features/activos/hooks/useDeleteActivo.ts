"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteActivo } from "../services/activos.api";

const QUERY_KEY_PREFIX = ["activos"] as const;

export function useDeleteActivo(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activoId: string) => {
      return deleteActivo(organizationId, activoId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
    },
  });
}
