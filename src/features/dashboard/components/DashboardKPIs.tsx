"use client";

import { Activity, UsersRound, CalendarDays, UserCheck } from "lucide-react";
import { useActividades } from "@/features/activities/hooks/useActividades";
import { usePrestadores } from "@/features/prestadores/hooks/usePrestadores";
import { useEvents } from "@/features/events/hooks/useEvents";
import { useReportePrestadoresActivos } from "@/features/reports/hooks/useReportePrestadoresActivos";

interface KPICardProps {
  label: string;
  value: string | number;
  isLoading?: boolean;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

function KPICard({ label, value, isLoading, icon: Icon }: KPICardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className="rounded-lg bg-(--primary)/10 p-2">
          <Icon className="size-5 text-(--primary)" aria-hidden />
        </span>
      </div>
      <div className="flex flex-col">
        <h3 className="text-2xl font-bold">
          {isLoading ? "—" : value}
        </h3>
        <p className="mt-1 text-xs text-slate-400">Total del área</p>
      </div>
    </div>
  );
}

interface DashboardKPIsProps {
  areaId: string;
}

export function DashboardKPIs({ areaId }: DashboardKPIsProps) {
  const actividades = useActividades(areaId);
  const prestadores = usePrestadores(areaId);
  const eventos = useEvents(areaId, { limit: 1 });
  const prestadoresActivos = useReportePrestadoresActivos(areaId);

  const totalActividades =
    actividades.pagination?.total ?? actividades.data?.length ?? 0;
  const totalPrestadores = prestadores.pagination?.total ?? 0;
  const totalEventos = eventos.pagination?.total ?? 0;
  const totalPrestadoresActivos = prestadoresActivos.data?.length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        label="Actividades"
        value={totalActividades}
        isLoading={actividades.isLoading}
        icon={Activity}
      />
      <KPICard
        label="Prestadores"
        value={totalPrestadores}
        isLoading={prestadores.isLoading}
        icon={UsersRound}
      />
      <KPICard
        label="Eventos"
        value={totalEventos}
        isLoading={eventos.isLoading}
        icon={CalendarDays}
      />
      <KPICard
        label="Prestadores activos"
        value={totalPrestadoresActivos}
        isLoading={prestadoresActivos.isLoading}
        icon={UserCheck}
      />
    </div>
  );
}
