"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useBloques } from "../hooks/useBloques";
import { useDeleteBloque } from "../hooks/useBloqueMutations";
import { BloqueForm, type BloqueFormTipo } from "./BloqueForm";
import type { Bloque } from "../types";

function formatDate(iso: string | null): string {
  if (!iso) return "Todas las fechas";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

interface BloquesListProps {
  areaId: string;
  actividadId: string;
  actividadName?: string;
}

export function BloquesList({ areaId, actividadId }: BloquesListProps) {
  const [dateFilter, setDateFilter] = useState("");
  const [showForm, setShowForm] = useState<BloqueFormTipo | null>(null);

  const {
    data: bloquesPlantilla,
    isLoading: loadingPlantilla,
    isError: errorPlantilla,
    error: errPlantilla,
    refetch: refetchPlantilla,
  } = useBloques(areaId, actividadId, { isTemplate: true });
  const paramsPorFecha = dateFilter
    ? { date: dateFilter, isTemplate: false }
    : { isTemplate: false };
  const {
    data: bloquesPorFecha,
    isLoading: loadingPorFecha,
    isError: errorPorFecha,
    error: errPorFecha,
    refetch: refetchPorFecha,
  } = useBloques(areaId, actividadId, paramsPorFecha);

  const deleteMutation = useDeleteBloque(areaId, actividadId);

  const handleDelete = async (b: Bloque) => {
    if (!confirm("¿Eliminar este bloque?")) return;
    try {
      await deleteMutation.mutateAsync(b.id);
      void refetchPlantilla();
      void refetchPorFecha();
    } catch {
      // Error manejado
    }
  };

  const handleFormSuccess = () => {
    setShowForm(null);
    void refetchPlantilla();
    void refetchPorFecha();
  };

  if (loadingPlantilla && loadingPorFecha) {
    return <p className="text-sm text-slate-500">Cargando bloques…</p>;
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Los <strong>bloques plantilla</strong> aplican a todas las fechas. Los{" "}
        <strong>bloques por fecha</strong> solo aplican al día indicado (p. ej.
        días festivos).
      </p>

      {/* Sección: Bloques plantilla */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Bloques plantilla
          </h3>
          <button
            type="button"
            onClick={() =>
              setShowForm(showForm === "plantilla" ? null : "plantilla")
            }
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
          >
            {showForm === "plantilla" ? "Cerrar" : "Nuevo bloque plantilla"}
          </button>
        </div>

        {showForm === "plantilla" && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
            <BloqueForm
              areaId={areaId}
              actividadId={actividadId}
              tipo="plantilla"
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(null)}
            />
          </div>
        )}

        {errorPlantilla && errPlantilla ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(errPlantilla)}
          </p>
        ) : !bloquesPlantilla?.length ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            No hay bloques plantilla. Crea uno para que se apliquen a todas las
            fechas.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Hora inicio
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Hora fin
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">
                    Capacidad
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Plantilla
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                {bloquesPlantilla.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2 text-sm">{b.startTime}</td>
                    <td className="px-4 py-2 text-sm">{b.endTime}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {b.capacidad}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                      {b.plantilla ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(b)}
                        disabled={deleteMutation.isPending}
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Sección: Bloques por fecha */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Bloques por fecha
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="text-sm text-slate-600 hover:underline dark:text-slate-400"
              >
                Limpiar filtro
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                setShowForm(showForm === "porFecha" ? null : "porFecha")
              }
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
            >
              {showForm === "porFecha" ? "Cerrar" : "Nuevo bloque por fecha"}
            </button>
          </div>
        </div>

        {showForm === "porFecha" && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
            <BloqueForm
              areaId={areaId}
              actividadId={actividadId}
              tipo="porFecha"
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(null)}
            />
          </div>
        )}

        {errorPorFecha && errPorFecha ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(errPorFecha)}
          </p>
        ) : !dateFilter ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            Elige una fecha para ver o crear bloques para ese día.
          </p>
        ) : !bloquesPorFecha?.length ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            No hay bloques para {formatDate(dateFilter)}. Crea uno si necesitas
            un horario especial.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Fecha
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Hora inicio
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Hora fin
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">
                    Capacidad
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                {bloquesPorFecha.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2 text-sm">{formatDate(b.date)}</td>
                    <td className="px-4 py-2 text-sm">{b.startTime}</td>
                    <td className="px-4 py-2 text-sm">{b.endTime}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {b.capacidad}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(b)}
                        disabled={deleteMutation.isPending}
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
