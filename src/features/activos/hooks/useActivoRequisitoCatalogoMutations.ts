"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createActivoRequisitoCatalogoItem,
  createActivoRequisitoCatalogoItemByDependencia,
  updateActivoRequisitoCatalogoItem,
  updateActivoRequisitoCatalogoItemByDependencia,
  deleteActivoRequisitoCatalogoItem,
  deleteActivoRequisitoCatalogoItemByDependencia,
} from "../services/activo-requisito-catalogo.api";
import type {
  CreateActivoRequisitoCatalogoPayload,
  UpdateActivoRequisitoCatalogoPayload,
} from "../types";

const QUERY_KEY_PREFIX = ["activo-requisito-catalogo"] as const;

export interface UseActivoRequisitoCatalogoMutationsOptions {
  dependenciaId?: string | null;
}

function getQueryKey(areaId: string, dependenciaId: string | null | undefined) {
  const useDep = Boolean(dependenciaId);
  return [...QUERY_KEY_PREFIX, useDep ? "dep" : "org", useDep ? dependenciaId : areaId] as const;
}

export function useCreateActivoRequisitoCatalogoItem(
  areaId: string,
  options: UseActivoRequisitoCatalogoMutationsOptions = {}
) {
  const queryClient = useQueryClient();
  const { dependenciaId } = options;
  const useDependencia = Boolean(dependenciaId);

  return useMutation({
    mutationFn: async (payload: CreateActivoRequisitoCatalogoPayload) => {
      return useDependencia && dependenciaId
        ? createActivoRequisitoCatalogoItemByDependencia(dependenciaId, payload)
        : createActivoRequisitoCatalogoItem(areaId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(areaId, dependenciaId),
      });
    },
  });
}

export function useUpdateActivoRequisitoCatalogoItem(
  areaId: string,
  options: UseActivoRequisitoCatalogoMutationsOptions = {}
) {
  const queryClient = useQueryClient();
  const { dependenciaId } = options;
  const useDependencia = Boolean(dependenciaId);

  return useMutation({
    mutationFn: async ({
      catalogoId,
      payload,
    }: {
      catalogoId: string;
      payload: UpdateActivoRequisitoCatalogoPayload;
    }) => {
      return useDependencia && dependenciaId
        ? updateActivoRequisitoCatalogoItemByDependencia(dependenciaId, catalogoId, payload)
        : updateActivoRequisitoCatalogoItem(areaId, catalogoId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(areaId, dependenciaId),
      });
    },
  });
}

export function useDeleteActivoRequisitoCatalogoItem(
  areaId: string,
  options: UseActivoRequisitoCatalogoMutationsOptions = {}
) {
  const queryClient = useQueryClient();
  const { dependenciaId } = options;
  const useDependencia = Boolean(dependenciaId);

  return useMutation({
    mutationFn: async (catalogoId: string) => {
      return useDependencia && dependenciaId
        ? deleteActivoRequisitoCatalogoItemByDependencia(dependenciaId, catalogoId)
        : deleteActivoRequisitoCatalogoItem(areaId, catalogoId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(areaId, dependenciaId),
      });
    },
  });
}
