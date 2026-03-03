"use client";

import Link from "next/link";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useEvents } from "../hooks/useEvents";

interface EventListProps {
  areaId: string;
}

export function EventList({ areaId }: EventListProps) {
  const { data: events, isLoading, isError, error } = useEvents(areaId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando eventos…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  if (!events?.length) {
    return (
      <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        No hay eventos. Crea uno para comenzar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Fecha</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Actividad</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Prestador</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Personas</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
          {events.map((ev) => (
            <tr key={ev.id}>
              <td className="px-4 py-2 text-sm">
                {ev.date ? new Date(ev.date).toLocaleDateString("es", { dateStyle: "short" }) : "—"}
              </td>
              <td className="px-4 py-2 text-sm">{ev.Actividad?.name ?? ev.actividadId}</td>
              <td className="px-4 py-2 text-sm">
                {ev.PrestadorProfile ? `Prestador ${ev.prestadorId}` : ev.prestadorId}
              </td>
              <td className="px-4 py-2 text-sm">{ev.peopleCount}</td>
              <td className="px-4 py-2 text-sm">{ev.status}</td>
              <td className="px-4 py-2">
                <Link
                  href={getDashboardHref(areaId, `/eventos/${ev.id}/evidencias`)}
                  className="text-sm font-medium text-(--cyan-accent) hover:underline"
                >
                  Evidencias
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
