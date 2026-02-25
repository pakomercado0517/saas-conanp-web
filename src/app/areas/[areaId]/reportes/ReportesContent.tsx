"use client";

import { useState } from "react";
import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { getApiErrorMessage } from "@/shared/types/api";
import { useReporteEventosPorActividad } from "@/features/reports/hooks/useReporteEventosPorActividad";

interface ReportesContentProps {
  areaId: string;
}

export function ReportesContent({ areaId }: ReportesContentProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const params = { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined };
  const { data, isLoading, isError, error } = useReporteEventosPorActividad(areaId, params);
  const inicioHref = getDashboardHref(areaId, "");

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Reportes
      </h1>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Eventos por actividad
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          <label className="flex items-center gap-1 text-sm">
            <span>Desde:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex items-center gap-1 text-sm">
            <span>Hasta:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
        </div>
        {isLoading ? (
          <p className="text-sm text-slate-500">Cargando reporte…</p>
        ) : isError && error ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(error)}
          </p>
        ) : data?.length ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Actividad</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Total eventos</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Total personas</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Programado</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">En curso</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Completado</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Cancelado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                {data.map((row) => (
                  <tr key={row.actividadId}>
                    <td className="px-4 py-2 text-sm">{row.actividadName}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.totalEventos}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.totalPersonas}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.eventosPorStatus?.programado ?? 0}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.eventosPorStatus?.en_curso ?? 0}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.eventosPorStatus?.completado ?? 0}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.eventosPorStatus?.cancelado ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            No hay datos para el rango seleccionado.
          </p>
        )}
      </section>

      <p className="text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Volver al inicio del área
        </Link>
      </p>
    </div>
  );
}
