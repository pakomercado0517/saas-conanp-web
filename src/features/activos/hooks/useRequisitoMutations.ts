"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRequisitoPayload) => {
      return createRequisito(
        organizationId,
        activoId,
        payload,
        accessToken ?? undefined
      );
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
  const accessToken = useAuthStore((s) => s.accessToken);
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
        payload,
        accessToken ?? undefined
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requisitoId: string) => {
      return deleteRequisito(
        organizationId,
        activoId,
        requisitoId,
        accessToken ?? undefined
      );
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requisitoId: string) => {
      return aprobarRequisito(
        organizationId,
        activoId,
        requisitoId,
        accessToken ?? undefined
      );
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
  const accessToken = useAuthStore((s) => s.accessToken);
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
        motivo,
        accessToken ?? undefined
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requisitoId: string) => {
      return suspenderRequisito(
        organizationId,
        activoId,
        requisitoId,
        accessToken ?? undefined
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
      });
    },
  });
}
