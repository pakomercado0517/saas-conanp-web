"use client";

import { useQuery } from "@tanstack/react-query";
import { listPermisos } from "../services/permisos.api";
import type { ListPermisosParams, Permiso } from "../types";
import { PERMISOS_QUERY_PREFIX } from "./permisosQueryKeys";

/**
 * Lista paginada de permisos filtrados por prestador (y opcionalmente actividad/estado).
 * Requiere `prestadorId` en params para ejecutar la query.
 */
export function usePermisosPorPrestador(
  organizationId: string,
  params: ListPermisosParams = {}
) {
  const prestadorId = params.prestadorId;
  const query = useQuery({
    queryKey: [...PERMISOS_QUERY_PREFIX, organizationId, params],
    queryFn: async () => {
      const res = await listPermisos(organizationId, params);
      return res;
    },
    enabled: Boolean(organizationId && prestadorId),
  });

  return {
    data: query.data?.data as Permiso[] | undefined,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
