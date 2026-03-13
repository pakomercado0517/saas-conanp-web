"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadEvidencia,
  updateEvidencia,
  deleteEvidencia,
} from "../services/evidencias.api";
import type { EvidenciaTipo, UpdateEvidenciaPayload } from "../types";

const QUERY_KEY_PREFIX = ["evidencias"] as const;

export function useUploadEvidencia(organizationId: string, eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      file: File;
      metadata?: {
        nombre?: string;
        descripcion?: string;
        tipo?: EvidenciaTipo;
      };
    }) => {
      return uploadEvidencia(
        organizationId,
        eventoId,
        params.file,
        params.metadata
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, eventoId],
      });
    },
  });
}

export function useUpdateEvidencia(organizationId: string, eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      evidenciaId,
      payload,
    }: {
      evidenciaId: string;
      payload: UpdateEvidenciaPayload;
    }) => {
      return updateEvidencia(
        organizationId,
        eventoId,
        evidenciaId,
        payload
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, eventoId],
      });
    },
  });
}

export function useDeleteEvidencia(organizationId: string, eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evidenciaId: string) => {
      return deleteEvidencia(
        organizationId,
        eventoId,
        evidenciaId
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, eventoId],
      });
    },
  });
}
