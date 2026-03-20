"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { AgendaType } from "../types";
import { getCapacidadActivoVerificar } from "../services/capacidadActivos.api";
import type { CapacidadActivoVerificarResponse } from "../services/capacidadActivos.api";

export function useCapacidadActivos(
  organizationId: string,
  options: {
    activoIds: string[];
    date: string;
    agendaType: AgendaType;
    bloqueId?: string;
    startTime?: string;
    endTime?: string;
    cantidad?: number;
  }
) {
  const queries = useQueries({
    queries: options.activoIds.map((activoId) => ({
      queryKey: [
        "capacidad",
        "verificar",
        "activos",
        organizationId,
        activoId,
        options.agendaType,
        options.date,
        options.bloqueId ?? "",
        options.startTime ?? "",
        options.endTime ?? "",
        options.cantidad ?? 0,
      ],
      queryFn: () =>
        getCapacidadActivoVerificar(organizationId, activoId, {
          agendaType: options.agendaType,
          date: options.date,
          bloqueId: options.agendaType === "BLOQUES" ? options.bloqueId : undefined,
          startTime: options.agendaType === "HORARIO_LIBRE" ? options.startTime : undefined,
          endTime: options.agendaType === "HORARIO_LIBRE" ? options.endTime : undefined,
          cantidad: options.cantidad,
        }),
      enabled:
        Boolean(
          organizationId &&
            activoId &&
            options.date &&
            options.agendaType &&
            (options.agendaType === "BLOQUES"
              ? options.bloqueId
              : Boolean(options.startTime && options.endTime))
        ),
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.isError)?.error;

  const dataByActivoId: Record<string, CapacidadActivoVerificarResponse | undefined> =
    useMemo(() => {
      const out: Record<
        string,
        CapacidadActivoVerificarResponse | undefined
      > = {};
      options.activoIds.forEach((id, i) => {
        out[id] = queries[i]?.data;
      });
      return out;
    }, [options.activoIds, queries]);

  return {
    dataByActivoId,
    isLoading,
    isError,
    error,
    refetch: () => Promise.all(queries.map((q) => q.refetch())),
  };
}

