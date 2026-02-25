"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  Shield,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";

/** Datos de ejemplo para el bosquejo. Reemplazar por datos reales cuando exista API. */
const KPI_ITEMS = [
  {
    label: "Total Superficie",
    value: "1.2M ha",
    trend: { direction: "up" as const, value: "+2.4%", sub: "vs mes pasado" },
    icon: Globe,
  },
  {
    label: "Áreas Protegidas",
    value: "182",
    trend: { direction: "neutral" as const, value: "0%", sub: "Sin cambios" },
    icon: Shield,
  },
  {
    label: "Presupuesto Ejecutado",
    value: "95.4%",
    trend: { direction: "down" as const, value: "-1.2%", sub: "vencimiento anual" },
    icon: DollarSign,
  },
  {
    label: "Alertas Activas",
    value: "12",
    trend: { direction: "down" as const, value: "-5%", sub: "mejoría detección" },
    icon: AlertTriangle,
  },
];

const EVENT_ROWS = [
  {
    evento: "Inspección de Zona A-12",
    responsable: "Ricardo M.",
    fecha: "Hace 2 horas",
    estatus: "Completado" as const,
  },
  {
    evento: "Alerta de Deforestación detectada",
    responsable: "Satélite V-4",
    fecha: "Hace 5 horas",
    estatus: "Crítico" as const,
  },
  {
    evento: "Actualización de Límites Geográficos",
    responsable: "Sonia L.",
    fecha: "Hoy, 10:45 AM",
    estatus: "Pendiente" as const,
  },
  {
    evento: "Reporte de Avistamiento Especies",
    responsable: "Voluntariado G.",
    fecha: "Ayer, 06:20 PM",
    estatus: "Completado" as const,
  },
  {
    evento: "Mantenimiento de Infraestructura",
    responsable: "Equipo Técnico",
    fecha: "Ayer, 04:00 PM",
    estatus: "En proceso" as const,
  },
];

const ESTATUS_STYLES: Record<
  string,
  string
> = {
  Completado:
    "rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Crítico:
    "rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Pendiente:
    "rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "En proceso":
    "rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {KPI_ITEMS.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon =
            kpi.trend.direction === "up"
              ? TrendingUp
              : kpi.trend.direction === "down"
                ? TrendingDown
                : Minus;
          const trendColor =
            kpi.trend.direction === "up"
              ? "text-emerald-500"
              : kpi.trend.direction === "down"
                ? "text-rose-500"
                : "text-slate-400";
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {kpi.label}
                </span>
                <span className="rounded-lg bg-(--primary)/10 p-2">
                  <Icon className="size-5 text-(--primary)" aria-hidden />
                </span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold">{kpi.value}</h3>
                <div className="mt-2 flex items-center gap-1">
                  <span className={trendColor}>
                    <TrendIcon className="size-4" aria-hidden />
                  </span>
                  <span className={`text-sm font-bold ${trendColor}`}>
                    {kpi.trend.value}
                  </span>
                  <span className="ml-1 text-xs text-slate-400">
                    {kpi.trend.sub}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid 2/3 + 1/3 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Tabla eventos */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <h2 className="text-lg font-bold">Eventos Recientes</h2>
            <Link
              href="#"
              className="text-sm font-semibold text-(--primary) hover:underline"
            >
              Ver todo
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4">Evento</th>
                  <th className="px-6 py-4">Responsable</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Estatus</th>
                  <th className="px-6 py-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {EVENT_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-6 py-4 font-medium">{row.evento}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {row.responsable}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{row.fecha}</td>
                    <td className="px-6 py-4">
                      <span className={ESTATUS_STYLES[row.estatus] ?? ""}>
                        {row.estatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="text-slate-400 transition-colors hover:text-(--primary)"
                        aria-label="Más opciones"
                      >
                        <MoreHorizontal className="size-5" aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna derecha: resumen + mapa */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-lg font-bold">Resumen Estadístico</h2>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Zonas Terrestres</span>
                  <span className="font-bold">64%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-(--primary)"
                    style={{ width: "64%" }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Zonas Marinas</span>
                  <span className="font-bold">36%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: "36%" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-tighter text-slate-500">
                    Personal Activo
                  </p>
                  <p className="text-xl font-bold">1,420</p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-tighter text-slate-500">
                    Vehículos
                  </p>
                  <p className="text-xl font-bold">342</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 group">
            <div className="absolute inset-0 z-10 bg-linear-to-t from-slate-900 to-transparent" />
            <Image
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
              alt="Vista de área natural protegida"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <p className="font-bold text-white">Ver Mapa de Calor</p>
              <p className="text-xs text-slate-400">
                Monitoreo satelital en tiempo real
              </p>
            </div>
            <div className="absolute right-4 top-4 z-20">
              <button
                type="button"
                className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                aria-label="Abrir mapa"
              >
                <ExternalLink className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
