"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listMemberships } from "../services/memberships.api";
import type { MembershipRole } from "../types";

const QUERY_KEY_PREFIX = ["memberships", "current-user-areas"] as const;

export interface MembershipRolesInAreasResult {
  /** Rol del usuario actual por área (solo áreas consultadas). */
  rolesByAreaId: Map<string, MembershipRole | null>;
  isLoading: boolean;
  isError: boolean;
  /** True si el usuario es administrador en al menos un área de la lista. */
  isAdminInAnyArea: boolean;
}

/**
 * Consulta membresías del usuario en varias áreas en paralelo (para gates en hub de dependencia).
 */
export function useMembershipRolesInAreas(
  areaIds: readonly string[]
): MembershipRolesInAreasResult {
  const userId = useAuthStore((s) => s.user?.id);

  const queries = useQueries({
    queries: areaIds.map((areaId) => ({
      queryKey: [...QUERY_KEY_PREFIX, areaId, userId],
      queryFn: async () => {
        const res = await listMemberships(areaId, { page: 1, limit: 100 });
        return res.data;
      },
      enabled: Boolean(areaId && userId),
    })),
  });

  const rolesByAreaId = useMemo(() => {
    const map = new Map<string, MembershipRole | null>();
    areaIds.forEach((areaId, index) => {
      const data = queries[index]?.data;
      const current = data?.find(
        (m) => m.User?.id === userId || m.userId === userId
      );
      map.set(areaId, current?.role ?? null);
    });
    return map;
  }, [areaIds, queries, userId]);

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const isAdminInAnyArea = useMemo(() => {
    for (const role of rolesByAreaId.values()) {
      if (role === "admin") return true;
    }
    return false;
  }, [rolesByAreaId]);

  return {
    rolesByAreaId,
    isLoading,
    isError,
    isAdminInAnyArea,
  };
}
