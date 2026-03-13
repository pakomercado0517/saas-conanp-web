"use client";

import Link from "next/link";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EmptyState } from "@/shared/components/EmptyState";
import { useEvents } from "@/features/events/hooks/useEvents";
import type { EventoStatus } from "@/features/events/types";

const EVENTO_STATUS_LABELS: Record<EventoStatus, string> = {
  programado: "Programado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

const EVENTO_STATUS_STYLES: Record<EventoStatus, string> = {
  programado:
    "rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  en_curso:
    "rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completado:
    "rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelado:
    "rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", { dateStyle: "short" });
}

interface EventosRecientesTableProps {
  areaId: string;
}

export function EventosRecientesTable({ areaId }: EventosRecientesTableProps) {
  const { data: events, isLoading, isError, error } = useEvents(areaId, {
    limit: 5,
    sortBy: "date",
    sortOrder: "desc",
  });

  const verTodoHref = getDashboardHref(areaId, "/eventos");

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
      <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
        <h2 className="text-lg font-bold">Eventos recientes</h2>
        <Link
          href={verTodoHref}
          className="text-sm font-semibold text-(--primary) hover:underline"
        >
          Ver todo
        </Link>
      </div>
      <div className="overflow-x-auto">
        {isLoading && (
          <div className="p-6 text-sm text-slate-500">Cargando eventos…</div>
        )}
        {isError && error && (
          <div className="p-6 text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(error)}
          </div>
        )}
        {!isLoading && !isError && (!events || events.length === 0) && (
          <div className="p-6">
            <EmptyState
              message="No hay eventos recientes."
              action={{
                label: "Ver eventos",
                href: verTodoHref,
              }}
            />
          </div>
        )}
        {!isLoading && !isError && events && events.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Actividad</th>
                <th className="px-6 py-4">Prestador</th>
                <th className="px-6 py-4">Personas</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {events.map((ev) => (
                <tr
                  key={ev.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                >
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {ev.date ? formatEventDate(ev.date) : "—"}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {ev.Actividad?.name ?? ev.actividadId}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {ev.PrestadorProfile ? `Prestador` : ev.prestadorId}
                  </td>
                  <td className="px-6 py-4">{ev.peopleCount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        EVENTO_STATUS_STYLES[ev.status] ??
                        "rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }
                    >
                      {EVENTO_STATUS_LABELS[ev.status] ?? ev.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={getDashboardHref(areaId, `/eventos/${ev.id}/evidencias`)}
                      className="text-sm font-medium text-(--primary) hover:underline"
                    >
                      Evidencias
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
