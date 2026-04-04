"use client";

import { useQuery } from "@tanstack/react-query";
import { getCapacidadVerificar } from "../services/capacidad.api";
import type { AgendaType } from "../types";

const QUERY_KEY_PREFIX = ["capacidad", "verificar", "actividad", "dia"] as const;

/**
 * Capacidad de la actividad para un día completo (sin `bloqueId`), p. ej. agenda HORARIO_LIBRE.
 * @see docs/api_routes/capacidad.md
 */
export function useCapacidadActividadDia(
  organizationId: string,
  actividadId: string,
  date: string,
  cantidad: number,
  agendaType: AgendaType,
  horarioLibreReady: boolean
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEY_PREFIX,
      organizationId,
      actividadId,
      date,
      cantidad,
    ],
    queryFn: () =>
      getCapacidadVerificar(organizationId, actividadId, {
        date,
        cantidad,
      }),
    enabled:
      Boolean(
        organizationId &&
          actividadId &&
          date &&
          cantidad >= 1 &&
          agendaType === "HORARIO_LIBRE" &&
          horarioLibreReady
      ),
  });
}
