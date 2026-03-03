"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getPermiso } from "../services/permisos.api";
import type { Permiso } from "../types";

const QUERY_KEY_PREFIX = ["permiso"] as const;

export function usePermiso(organizationId: string, permisoId: string | null) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, permisoId],
    queryFn: async () => {
      if (!permisoId) throw new Error("permisoId required");
      const res = await getPermiso(
        organizationId,
        permisoId,
        accessToken ?? undefined
      );
      return res.data;
    },
    enabled: Boolean(accessToken && organizationId && permisoId),
  });

  return {
    data: query.data as Permiso | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
