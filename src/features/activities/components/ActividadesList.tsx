"use client";

import Link from "next/link";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EmptyState } from "@/shared/components/EmptyState";
import { useActividades } from "../hooks/useActividades";
import type { AgendaType, NivelImpacto } from "../types";

const AGENDA_LABELS: Record<AgendaType, string> = {
  BLOQUES: "Bloques",
  HORARIO_LIBRE: "Horario libre",
};

const IMPACTO_LABELS: Record<NivelImpacto, string> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
};

interface ActividadesListProps {
  areaId: string;
}

export function ActividadesList({ areaId }: ActividadesListProps) {
  const {
    data: actividades,
    isLoading,
    isError,
    error,
  } = useActividades(areaId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando actividades…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  if (!actividades?.length) {
    return (
      <div className="space-y-4">
        <Link
          href={getDashboardHref(areaId, "/actividades/nueva")}
          className="inline-flex rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Nueva actividad
        </Link>
        <EmptyState
          message="No hay actividades en esta área. Crea una para comenzar."
          action={{
            label: "Crear actividad",
            href: getDashboardHref(areaId, "/actividades/nueva"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={getDashboardHref(areaId, "/actividades/nueva")}
        className="inline-flex rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        Nueva actividad
      </Link>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Nombre
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Tipo agenda
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Requiere guía
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Nivel impacto
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Estado
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
          {actividades.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                {a.name}
              </td>
              <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                {AGENDA_LABELS[a.agendaType ?? "HORARIO_LIBRE"]}
              </td>
              <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                {a.requiereGuia ? "Sí" : "No"}
              </td>
              <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                {a.nivelImpacto ? IMPACTO_LABELS[a.nivelImpacto] : "—"}
              </td>
              <td className="px-4 py-2 text-sm">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    a.active !== false
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {a.active !== false ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td className="px-4 py-2">
                <span className="flex flex-wrap items-center gap-2">
                  <Link
                    href={getDashboardHref(areaId, `/actividades/${a.id}/editar`)}
                    className="text-sm font-medium text-(--primary) hover:underline"
                  >
                    Editar
                  </Link>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <Link
                    href={getDashboardHref(
                      areaId,
                      `/actividades/${a.id}/bloques`
                    )}
                    className="text-sm font-medium text-(--cyan-accent) hover:underline"
                  >
                    Bloques
                  </Link>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
