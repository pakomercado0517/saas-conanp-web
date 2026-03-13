"use client";

import { useQuery } from "@tanstack/react-query";
import { listOrganizations } from "../services/organizations.api";
import type { ListOrganizationsParams } from "../types";

const QUERY_KEY = ["organizations"] as const;

export function useOrganizations(params: ListOrganizationsParams = {}) {
  const query = useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => listOrganizations(params),
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
