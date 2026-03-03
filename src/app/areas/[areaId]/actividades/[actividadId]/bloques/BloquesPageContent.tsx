"use client";

import { useActividad } from "@/features/activities/hooks/useActividad";
import { BloquesList } from "@/features/blocks/components/BloquesList";
import { CapacidadSection } from "@/features/activities/components/CapacidadSection";
import { getApiErrorMessage } from "@/shared/types/api";

interface BloquesPageContentProps {
  areaId: string;
  actividadId: string;
}

export function BloquesPageContent({
  areaId,
  actividadId,
}: BloquesPageContentProps) {
  const { data: actividad, isLoading, isError, error } = useActividad(
    areaId,
    actividadId
  );

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando actividad…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  const actividadName = actividad?.name;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          {actividadName ?? "Actividad"}
        </h2>
        <BloquesList
          areaId={areaId}
          actividadId={actividadId}
          actividadName={actividadName}
        />
      </div>

      <CapacidadSection
        areaId={areaId}
        actividadId={actividadId}
        actividadName={actividadName}
      />
    </div>
  );
}
