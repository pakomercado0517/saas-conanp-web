"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  createProductoAcceso,
  updateProductoAcceso,
  deleteProductoAcceso,
} from "../services/access-products.api";
import type {
  CreateProductoAccesoPayload,
  UpdateProductoAccesoPayload,
} from "../types";

const QUERY_KEY_PREFIX = ["access-products"] as const;

export function useCreateProductoAcceso(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateProductoAccesoPayload) =>
      createProductoAcceso(organizationId, payload, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PREFIX, organizationId] });
    },
  });

  return {
    create: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useUpdateProductoAcceso(organizationId: string, productoId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateProductoAccesoPayload) =>
      updateProductoAcceso(organizationId, productoId, payload, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PREFIX, organizationId] });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, "producto", organizationId, productoId],
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

export function useDeleteProductoAcceso(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (productoId: string) =>
      deleteProductoAcceso(organizationId, productoId, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PREFIX, organizationId] });
    },
  });

  return {
    remove: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
