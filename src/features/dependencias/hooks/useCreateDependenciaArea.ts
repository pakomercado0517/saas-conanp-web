"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDependenciaArea } from "../services/dependencias.api";
import { DEPENDENCIA_AREAS_KEY } from "./useDependenciaAreas";
import type {
  CreateDependenciaAreaPayload,
  DependenciaArea,
  ListDependenciaAreasResponse,
} from "../types";

export function useCreateDependenciaArea(dependenciaId: string) {
  const queryClient = useQueryClient();
  const areasKey = DEPENDENCIA_AREAS_KEY(dependenciaId);

  const mutation = useMutation({
    mutationFn: (payload: CreateDependenciaAreaPayload) =>
      createDependenciaArea(dependenciaId, payload),
    onMutate: async (newArea) => {
      await queryClient.cancelQueries({ queryKey: areasKey });
      const previous =
        queryClient.getQueryData<ListDependenciaAreasResponse>(areasKey);

      queryClient.setQueryData<ListDependenciaAreasResponse>(areasKey, (old) => {
        if (!old) return old;
        const optimistic: DependenciaArea = {
          id: `optimistic-${Date.now()}`,
          dependenciaId,
          name: newArea.name,
          ecosystem_type: newArea.ecosystem_type,
          settings: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return {
          ...old,
          data: [...old.data, optimistic],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        };
      });

      return { previous };
    },
    onError: (_err, _newArea, context) => {
      if (context?.previous) {
        queryClient.setQueryData(areasKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: areasKey });
    },
  });

  return {
    create: mutation.mutateAsync as (
      payload: CreateDependenciaAreaPayload
    ) => Promise<{ success: true; data: DependenciaArea; message?: string }>,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
