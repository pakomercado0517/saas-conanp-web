"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listActivoRequisitoCatalogo,
  listActivoRequisitoCatalogoByDependencia,
} from "../services/activo-requisito-catalogo.api";
import { ApiError } from "@/shared/types/api";
import type { ActivoRequisitoCatalogoItem } from "../types";

const QUERY_KEY_PREFIX = ["activo-requisito-catalogo"] as const;

export interface UseActivoRequisitoCatalogoOptions {
  /** Cuando el backend almacena el catálogo por dependenciaId, pasar el ID de la dependencia del área. */
  dependenciaId?: string | null;
}

/**
 * Obtiene todo el catálogo de requisitos del área (sin filtrar por tipo).
 * Si se pasa dependenciaId, usa la API por dependencia (catálogo asociado a la dependencia).
 */
export function useActivoRequisitoCatalogo(
  areaId: string,
  options: UseActivoRequisitoCatalogoOptions = {}
) {
  const { dependenciaId } = options;
  const useDependencia = Boolean(dependenciaId);

  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, useDependencia ? "dep" : "org", useDependencia ? dependenciaId : areaId],
    queryFn: async () => {
      if (useDependencia && dependenciaId) {
        try {
          return await listActivoRequisitoCatalogoByDependencia(dependenciaId, {});
        } catch (err) {
          // Fallback: algunos entornos no exponen el endpoint por dependencia,
          // aunque el catálogo esté relacionado por dependenciaId en BD.
          if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 405)) {
            return listActivoRequisitoCatalogo(areaId, {});
          }
          throw err;
        }
      }
      return listActivoRequisitoCatalogo(areaId, {});
    },
    enabled: useDependencia ? Boolean(dependenciaId) : Boolean(areaId),
  });

  return {
    data: query.data as ActivoRequisitoCatalogoItem[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
