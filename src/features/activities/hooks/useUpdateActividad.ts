"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActividad } from "../services/activities.api";
import type { UpdateActividadPayload } from "../types";

const LIST_QUERY_KEY = ["activities"] as const;
const DETAIL_QUERY_KEY = ["actividad"] as const;

export function useUpdateActividad(
  organizationId: string,
  actividadId: string
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...LIST_QUERY_KEY, "update", organizationId, actividadId],
    mutationFn: (payload: UpdateActividadPayload) =>
      updateActividad(organizationId, actividadId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...LIST_QUERY_KEY, organizationId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...DETAIL_QUERY_KEY, organizationId, actividadId],
      });
    },
  });

  return {
    update: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
