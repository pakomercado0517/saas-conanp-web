"use client";

import { useQuery } from "@tanstack/react-query";
import { listOrganizations } from "../services/organizations.api";
import type { ListOrganizationsParams } from "../types";

const QUERY_KEY = ["organizations"] as const;

type UseOrganizationsOptions = {
  params?: ListOrganizationsParams;
  accessToken?: string | null;
};

export function useOrganizations(options: UseOrganizationsOptions = {}) {
  const { params = {}, accessToken = null } = options;
  const query = useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => listOrganizations(params, accessToken),
    enabled: true,
  });
  return {
    data: query.data?.data,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
