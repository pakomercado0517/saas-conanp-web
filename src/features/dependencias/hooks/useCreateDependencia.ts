"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDependencia } from "../services/dependencias.api";
import { DEPENDENCIAS_QUERY_KEY } from "./useDependencias";
import type { CreateDependenciaPayload, Dependencia } from "../types";

export function useCreateDependencia() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateDependenciaPayload) =>
      createDependencia(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPENDENCIAS_QUERY_KEY });
    },
  });

  return {
    create: mutation.mutateAsync as (
      payload: CreateDependenciaPayload
    ) => Promise<{ success: true; data: Dependencia; message?: string }>,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
