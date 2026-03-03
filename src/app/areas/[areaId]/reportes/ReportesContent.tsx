"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { getApiErrorMessage } from "@/shared/types/api";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { useReporteEventosPorActividad } from "@/features/reports/hooks/useReporteEventosPorActividad";
import { useReporteEventosPorPrestadorFecha } from "@/features/reports/hooks/useReporteEventosPorPrestadorFecha";
import { useReporteCapacidadUtilizada } from "@/features/reports/hooks/useReporteCapacidadUtilizada";
import { useReportePrestadoresActivos } from "@/features/reports/hooks/useReportePrestadoresActivos";
import { useReporteStockBrazaletes } from "@/features/reports/hooks/useReporteStockBrazaletes";
import { useReporteVentasBrazaletes } from "@/features/reports/hooks/useReporteVentasBrazaletes";
import { usePrestadores } from "@/features/prestadores/hooks/usePrestadores";

interface ReportesContentProps {
  areaId: string;
}

export function ReportesContent({ areaId }: ReportesContentProps) {
  const { showProductosAcceso } = useAreaContext();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [prestadorId, setPrestadorId] = useState("");

  const params = { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined };
  const paramsPrestador = {
    ...params,
    prestadorId: prestadorId || undefined,
  };

  const { data: eventosPorActividad, isLoading: loadingActividad, isError: errorActividad, error: errActividad } =
    useReporteEventosPorActividad(areaId, params);
  const { data: eventosPorPrestador, isLoading: loadingPrestador, isError: errorPrestador, error: errPrestador } =
    useReporteEventosPorPrestadorFecha(areaId, paramsPrestador);
  const { data: capacidadUtilizada, isLoading: loadingCapacidad, isError: errorCapacidad, error: errCapacidad } =
    useReporteCapacidadUtilizada(areaId, params);
  const { data: prestadoresActivos, isLoading: loadingPrestadoresActivos, isError: errorPrestadoresActivos, error: errPrestadoresActivos } =
    useReportePrestadoresActivos(areaId);
  const { data: stockBrazaletes, isLoading: loadingStock, isError: errorStock, error: errStock } =
    useReporteStockBrazaletes(areaId, params);
  const { data: ventasBrazaletes, isLoading: loadingVentas, isError: errorVentas, error: errVentas } =
    useReporteVentasBrazaletes(areaId, params);
  const { data: prestadores } = usePrestadores(areaId);

  const inicioHref = getDashboardHref(areaId, "");

  const dateFilter = (
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
  );

  return (
    <div className="p-4 md:p-6 space-y-8">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Reportes
      </h1>

      {/* Eventos por actividad */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Eventos por actividad
        </h2>
        {dateFilter}
        {loadingActividad ? (
          <p className="text-sm text-slate-500">Cargando reporte…</p>
        ) : errorActividad && errActividad ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(errActividad)}
          </p>
        ) : eventosPorActividad?.length ? (
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
                {eventosPorActividad.map((row) => (
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

      {/* Eventos por prestador y fecha */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Eventos por prestador y fecha
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          <label className="flex items-center gap-1 text-sm">
            <span>Prestador:</span>
            <select
              value={prestadorId}
              onChange={(e) => setPrestadorId(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Todos</option>
              {prestadores?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.User?.name ?? p.email ?? p.id}
                </option>
              ))}
            </select>
          </label>
          {dateFilter}
        </div>
        {loadingPrestador ? (
          <p className="text-sm text-slate-500">Cargando reporte…</p>
        ) : errorPrestador && errPrestador ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(errPrestador)}
          </p>
        ) : eventosPorPrestador?.length ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Prestador</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Total eventos</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Total personas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                {eventosPorPrestador.map((row) => (
                  <tr key={row.prestadorId}>
                    <td className="px-4 py-2 text-sm">{row.prestadorName}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.totalEventos}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.totalPersonas}</td>
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

      {/* Capacidad utilizada */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Capacidad utilizada
        </h2>
        {dateFilter}
        {loadingCapacidad ? (
          <p className="text-sm text-slate-500">Cargando reporte…</p>
        ) : errorCapacidad && errCapacidad ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(errCapacidad)}
          </p>
        ) : capacidadUtilizada?.length ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Actividad</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Fecha</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Capacidad total</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Utilizada</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                {capacidadUtilizada.map((row, i) => (
                  <tr key={`${row.actividadId}-${row.fecha}-${i}`}>
                    <td className="px-4 py-2 text-sm">{row.actividadName}</td>
                    <td className="px-4 py-2 text-sm">{row.fecha}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.capacidadTotal}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.capacidadUtilizada}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {row.porcentajeUtilizado != null ? `${row.porcentajeUtilizado}%` : row.capacidadTotal > 0 ? `${Math.round((row.capacidadUtilizada / row.capacidadTotal) * 100)}%` : "—"}
                    </td>
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

      {/* Prestadores activos */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Prestadores activos
        </h2>
        {loadingPrestadoresActivos ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : errorPrestadoresActivos && errPrestadoresActivos ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(errPrestadoresActivos)}
          </p>
        ) : prestadoresActivos?.length ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Prestador</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Eventos recientes</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Última actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                {prestadoresActivos.map((row) => (
                  <tr key={row.prestadorId}>
                    <td className="px-4 py-2 text-sm">{row.prestadorName}</td>
                    <td className="px-4 py-2 text-sm text-right">{row.eventosRecientes ?? "—"}</td>
                    <td className="px-4 py-2 text-sm">{row.ultimaActividad ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            No hay datos disponibles.
          </p>
        )}
      </section>

      {/* Stock y ventas de brazaletes (condicional) */}
      {showProductosAcceso && (
        <>
          <section>
            <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Stock de brazaletes
            </h2>
            {dateFilter}
            {loadingStock ? (
              <p className="text-sm text-slate-500">Cargando reporte…</p>
            ) : errorStock && errStock ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {getApiErrorMessage(errStock)}
              </p>
            ) : stockBrazaletes?.length ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Producto</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Stock actual</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Entradas</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Salidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                    {stockBrazaletes.map((row) => (
                      <tr key={row.productoId}>
                        <td className="px-4 py-2 text-sm">{row.productoName}</td>
                        <td className="px-4 py-2 text-sm text-right">{row.stockActual}</td>
                        <td className="px-4 py-2 text-sm text-right">{row.entradas ?? "—"}</td>
                        <td className="px-4 py-2 text-sm text-right">{row.salidas ?? "—"}</td>
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

          <section>
            <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Ventas de brazaletes
            </h2>
            {dateFilter}
            {loadingVentas ? (
              <p className="text-sm text-slate-500">Cargando reporte…</p>
            ) : errorVentas && errVentas ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {getApiErrorMessage(errVentas)}
              </p>
            ) : ventasBrazaletes?.length ? (
              <>
                <div className="mb-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventasBrazaletes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="productoName" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cantidadVendida" fill="var(--cyan-accent)" name="Cantidad vendida" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Producto</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Cantidad vendida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                      {ventasBrazaletes.map((row) => (
                        <tr key={row.productoId}>
                          <td className="px-4 py-2 text-sm">{row.productoName}</td>
                          <td className="px-4 py-2 text-sm text-right">{row.cantidadVendida}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No hay datos para el rango seleccionado.
              </p>
            )}
          </section>
        </>
      )}

      <p className="text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Volver al inicio del área
        </Link>
      </p>
    </div>
  );
}
