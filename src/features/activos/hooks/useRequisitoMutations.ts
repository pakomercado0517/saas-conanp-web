"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRequisito,
  updateRequisito,
  deleteRequisito,
  aprobarRequisito,
  rechazarRequisito,
  suspenderRequisito,
} from "../services/requisitos.api";
import type {
  CreateRequisitoPayload,
  UpdateRequisitoPayload,
} from "../types";

const QUERY_KEY_PREFIX = ["requisitos"] as const;

export function useCreateRequisito(
  organizationId: string,
  activoId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRequisitoPayload) => {
      return createRequisito(organizationId, activoId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
      });
    },
  });
}

export function useUpdateRequisito(
  organizationId: string,
  activoId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requisitoId,
      payload,
    }: { requisitoId: string; payload: UpdateRequisitoPayload }) => {
      return updateRequisito(
        organizationId,
        activoId,
        requisitoId,
        payload
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
      });
    },
  });
}

export function useDeleteRequisito(
  organizationId: string,
  activoId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requisitoId: string) => {
      return deleteRequisito(organizationId, activoId, requisitoId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
      });
    },
  });
}

export function useAprobarRequisito(
  organizationId: string,
  activoId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requisitoId: string) => {
      return aprobarRequisito(organizationId, activoId, requisitoId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
      });
    },
  });
}

export function useRechazarRequisito(
  organizationId: string,
  activoId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requisitoId,
      motivo,
    }: { requisitoId: string; motivo: string }) => {
      return rechazarRequisito(
        organizationId,
        activoId,
        requisitoId,
        motivo
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
      });
    },
  });
}

export function useSuspenderRequisito(
  organizationId: string,
  activoId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requisitoId: string) => {
      return suspenderRequisito(organizationId, activoId, requisitoId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
      });
    },
  });
}
