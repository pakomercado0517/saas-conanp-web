"use client";

import { useQuery } from "@tanstack/react-query";
import type { PrestadorConPermisosItem } from "@/features/prestadores/types";
import { listPrestadoresConPermisos } from "@/features/prestadores/services/prestadores.api";
import { mapPrestadoresConPermisosItemsToResumen } from "../lib/mapPrestadoresConPermisosToResumen";
import type { PrestadorPermisosResumen } from "../types";
import { permisosByOrganizationKey } from "./permisosQueryKeys";

const LIST_PAGE_LIMIT = 100;
/** Límite de páginas (prestadores) ante respuestas anómalas del API. */
const MAX_FETCH_PAGES = 50;

export function usePermisosAggregatedByPrestador(
  organizationId: string,
  options?: { enabled?: boolean }
) {
  const query = useQuery({
    queryKey: permisosByOrganizationKey(organizationId),
    queryFn: async (): Promise<PrestadorPermisosResumen[]> => {
      const allItems: PrestadorConPermisosItem[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const res = await listPrestadoresConPermisos(organizationId, {
          page,
          limit: LIST_PAGE_LIMIT,
        });
        allItems.push(...res.data);
        totalPages = res.pagination.totalPages;
        page += 1;
      } while (page <= totalPages && page <= MAX_FETCH_PAGES);

      return mapPrestadoresConPermisosItemsToResumen(allItems);
    },
    enabled: Boolean(organizationId) && options?.enabled !== false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
