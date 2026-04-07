"use client";

import { useQuery } from "@tanstack/react-query";
import { findNombreFromRequisitos } from "../lib/activo-nombre-from-requisitos";
import { listRequisitos } from "../services/requisitos.api";

const QUERY_KEY_PREFIX = ["activo-nombre-requisito"] as const;

export function getActivoNombreQueryKey(
  organizationId: string,
  activoId: string
) {
  return [...QUERY_KEY_PREFIX, organizationId, activoId] as const;
}

export interface UseActivoNombreOptions {
  /**
   * Nombre denormalizado en el activo (listado/detalle). Tiene prioridad sobre el
   * requisito con clave `nombre`, igual que en la cabecera de `ActivoDetail`.
   */
  fallbackNombre?: string | null;
}

export function useActivoNombre(
  organizationId: string,
  activoId: string,
  options?: UseActivoNombreOptions
) {
  const query = useQuery({
    queryKey: getActivoNombreQueryKey(organizationId, activoId),
    queryFn: async () => {
      const requisitos = await listRequisitos(organizationId, activoId);
      return findNombreFromRequisitos(requisitos);
    },
    enabled: Boolean(organizationId && activoId),
    staleTime: 60_000,
  });

  const fromRequisitos =
    query.data?.trim() && query.data.trim().length > 0
      ? query.data.trim()
      : null;
  const fallback =
    options?.fallbackNombre?.trim() && options.fallbackNombre.trim().length > 0
      ? options.fallbackNombre.trim()
      : null;

  const nombre = fallback ?? fromRequisitos ?? null;

  return {
    nombre,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

