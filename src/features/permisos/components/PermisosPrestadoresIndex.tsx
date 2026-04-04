"use client";

import Link from "next/link";
import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { formatDate } from "@/shared/lib/date";
import { EmptyState } from "@/shared/components/EmptyState";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { usePermisosAggregatedByPrestador } from "../hooks/usePermisosAggregatedByPrestador";
import { PermisoForm } from "./PermisoForm";
import type { PrestadorPermisosResumen } from "../types";

interface PermisosPrestadoresIndexProps {
  areaId: string;
}

function buildDetalleHref(
  areaId: string,
  row: PrestadorPermisosResumen
): string {
  const base = getDashboardHref(areaId, "/permisos");
  return `${base}?prestadorId=${encodeURIComponent(row.prestadorId)}`;
}

export function PermisosPrestadoresIndex({
  areaId,
}: PermisosPrestadoresIndexProps) {
  const { role } = useAreaContext();
  const isAdmin = role === "admin";
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    data: filas,
    isLoading,
    isError,
    error,
  } = usePermisosAggregatedByPrestador(areaId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando prestadores…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  if (!filas?.length) {
    return (
      <div className="space-y-4">
        <EmptyState message="Ningún prestador tiene permisos registrados en esta área todavía." />
        {isAdmin && !showCreateForm ? (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:bg-slate-200 dark:text-slate-900 dark:focus-visible:ring-slate-400"
          >
            Registrar primer permiso
          </button>
        ) : null}
        {isAdmin && showCreateForm ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nuevo permiso
            </h3>
            <PermisoForm
              areaId={areaId}
              onSuccess={() => {
                setShowCreateForm(false);
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Prestadores con al menos un permiso en esta área. Elige uno para ver el
        detalle, filtros y acciones.
      </p>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Prestador
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Correo
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Permisos
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Actividades
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Activos
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Vigencia hasta (máx.)
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
            {filas.map((row) => (
              <tr key={row.prestadorId}>
                <td className="px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                  {row.displayName}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                  {row.email ?? "—"}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                  {row.totalPermisos}
                </td>
                <td className="max-w-xs px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                  {row.actividadesResumen != null &&
                  row.actividadesResumen.length > 0
                    ? row.actividadesResumen
                    : "—"}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                  {row.activosCount}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                  {row.vigenciaHastaMax
                    ? formatDate(row.vigenciaHastaMax)
                    : "—"}
                </td>
                <td className="px-4 py-2 text-sm">
                  <Link
                    href={buildDetalleHref(areaId, row)}
                    className="font-medium text-(--cyan-accent) hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
