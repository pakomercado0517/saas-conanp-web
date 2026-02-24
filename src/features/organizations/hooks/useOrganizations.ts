"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listOrganizations } from "../services/organizations.api";
import type { ListOrganizationsParams } from "../types";

const QUERY_KEY = ["organizations"] as const;

type UseOrganizationsOptions = {
  params?: ListOrganizationsParams;
  /** Si no se pasa, se usa el token del store de auth (recomendado en rutas protegidas). */
  accessToken?: string | null;
};

export function useOrganizations(options: UseOrganizationsOptions = {}) {
  const tokenFromStore = useAuthStore((s) => s.accessToken);
  const { params = {}, accessToken: tokenOption } = options;
  const accessToken = tokenOption !== undefined ? tokenOption : tokenFromStore;

  const query = useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => listOrganizations(params, accessToken ?? undefined),
    enabled: Boolean(accessToken),
  });

  return {
    data: query.data?.data,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
