"use client";

import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { ActividadForm } from "@/features/activities/components/ActividadForm";
import { useActividad } from "@/features/activities/hooks/useActividad";

interface EditarActividadContentProps {
  areaId: string;
  actividadId: string;
}

export function EditarActividadContent({
  areaId,
  actividadId,
}: EditarActividadContentProps) {
  const router = useRouter();
  const { data: actividad, isLoading, isError, error } = useActividad(
    areaId,
    actividadId
  );

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  if (!actividad) {
    return (
      <p className="text-sm text-slate-500">
        No se encontró la actividad.
      </p>
    );
  }

  return (
    <ActividadForm
      areaId={areaId}
      actividad={actividad}
      onSuccess={() => {
        router.push(getDashboardHref(areaId, "/actividades"));
      }}
      onCancel={() => {
        router.push(getDashboardHref(areaId, "/actividades"));
      }}
    />
  );
}
