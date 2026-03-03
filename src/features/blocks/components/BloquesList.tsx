"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useBloques } from "../hooks/useBloques";
import { useDeleteBloque } from "../hooks/useBloqueMutations";
import { BloqueForm } from "./BloqueForm";
import type { Bloque } from "../types";

function formatDate(iso: string): string {
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

export function BloquesList({
  areaId,
  actividadId,
  actividadName,
}: BloquesListProps) {
  const [dateFilter, setDateFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const params = dateFilter ? { date: dateFilter } : {};
  const { data: bloques, isLoading, isError, error, refetch } = useBloques(
    areaId,
    actividadId,
    params
  );
  const deleteMutation = useDeleteBloque(areaId, actividadId);

  const handleDelete = async (b: Bloque) => {
    if (!confirm("¿Eliminar este bloque?")) return;
    try {
      await deleteMutation.mutateAsync(b.id);
      void refetch();
    } catch {
      // Error manejado
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    void refetch();
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando bloques…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
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
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
        >
          Nuevo bloque
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Crear bloque
          </h3>
          <BloqueForm
            areaId={areaId}
            actividadId={actividadId}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {!bloques?.length ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          {actividadName
            ? `No hay bloques para "${actividadName}".`
            : "No hay bloques para esta actividad."}
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
                  Plantilla
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
              {bloques.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2 text-sm">{formatDate(b.date)}</td>
                  <td className="px-4 py-2 text-sm">{b.startTime}</td>
                  <td className="px-4 py-2 text-sm">{b.endTime}</td>
                  <td className="px-4 py-2 text-sm text-right">{b.capacidad}</td>
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
    </div>
  );
}
