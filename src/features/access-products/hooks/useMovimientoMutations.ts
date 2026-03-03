"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { registrarEntrada, registrarSalida } from "../services/access-products.api";
import type { RegistrarEntradaPayload, RegistrarSalidaPayload } from "../types";

const QUERY_KEY_PREFIX = ["access-products", "movimientos"] as const;

export function useRegistrarEntrada(organizationId: string, productoId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: RegistrarEntradaPayload) =>
      registrarEntrada(organizationId, productoId, payload, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, productoId],
      });
    },
  });

  return {
    registrar: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useRegistrarSalida(organizationId: string, productoId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: RegistrarSalidaPayload) =>
      registrarSalida(organizationId, productoId, payload, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId, productoId],
      });
    },
  });

  return {
    registrar: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
