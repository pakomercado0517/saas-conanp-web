"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  createBloque,
  updateBloque,
  deleteBloque,
} from "../services/blocks.api";
import type { CreateBloquePayload, UpdateBloquePayload } from "../types";

const QUERY_KEY_PREFIX = ["bloques"] as const;

export function useCreateBloque(
  organizationId: string,
  actividadId: string
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBloquePayload) => {
      return createBloque(
        organizationId,
        actividadId,
        payload,
        accessToken ?? undefined
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, actividadId],
      });
    },
  });
}

export function useUpdateBloque(
  organizationId: string,
  actividadId: string
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bloqueId,
      payload,
    }: { bloqueId: string; payload: UpdateBloquePayload }) => {
      return updateBloque(
        organizationId,
        actividadId,
        bloqueId,
        payload,
        accessToken ?? undefined
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, actividadId],
      });
    },
  });
}

export function useDeleteBloque(
  organizationId: string,
  actividadId: string
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bloqueId: string) => {
      return deleteBloque(
        organizationId,
        actividadId,
        bloqueId,
        accessToken ?? undefined
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, actividadId],
      });
    },
  });
}
