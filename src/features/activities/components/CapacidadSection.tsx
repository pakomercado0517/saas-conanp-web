"use client";

interface CapacidadSectionProps {
  areaId: string;
  actividadId: string;
  actividadName?: string;
}

/**
 * UI para capacidad por actividad y fecha.
 * Requiere endpoint GET /organizations/:id/actividades/:actividadId/capacidad?date=YYYY-MM-DD.
 * Validar con backend si existe; mientras tanto se muestra mensaje informativo.
 */
export function CapacidadSection({ actividadName }: CapacidadSectionProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Capacidad utilizada
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {actividadName
          ? `La capacidad por bloque de "${actividadName}" se valida al crear eventos.`
          : "La capacidad por bloque se valida al crear eventos."}{" "}
        Si el backend expone un endpoint de capacidad utilizada, aquí se
        mostrará el detalle por fecha.
      </p>
    </div>
  );
}
