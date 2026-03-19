"use client";

import { useQuery } from "@tanstack/react-query";
import { listRequisitos } from "../services/requisitos.api";

const QUERY_KEY_PREFIX = ["activo-nombre-requisito"] as const;

function findNombreFromRequisitos(requisitos: { clave: string; valor: string }[]): string | null {
  for (const r of requisitos) {
    const key = r.clave.trim().toLowerCase();
    if (key === "nombre") {
      const v = r.valor?.trim();
      return v ? v : null;
    }
  }
  return null;
}

export function useActivoNombre(organizationId: string, activoId: string) {
  const query = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, organizationId, activoId],
    queryFn: async () => {
      const requisitos = await listRequisitos(organizationId, activoId);
      return findNombreFromRequisitos(requisitos);
    },
    enabled: Boolean(organizationId && activoId),
    staleTime: 60_000,
  });

  return {
    nombre: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

