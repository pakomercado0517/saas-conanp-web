"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createActividad,
  type CreateActividadInput,
} from "../services/activities.api";

const QUERY_KEY_PREFIX = ["activities"] as const;

export function useCreateActividad(organizationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...QUERY_KEY_PREFIX, "create", organizationId],
    mutationFn: (payload: CreateActividadInput) =>
      createActividad(organizationId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
    },
  });

  return {
    create: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
