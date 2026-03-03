"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useActivo } from "../hooks/useActivo";
import { ActivoForm } from "./ActivoForm";
import { RequisitosSection } from "./RequisitosSection";
import type { ActivoTipo, ActivoStatus } from "../types";

const TIPO_LABELS: Record<ActivoTipo, string> = {
  vehiculo: "Vehículo",
  equipo: "Equipo",
  infraestructura: "Infraestructura",
  otro: "Otro",
};

const STATUS_LABELS: Record<ActivoStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  suspendido: "Suspendido",
  pendiente_validacion: "Pendiente validación",
};

interface ActivoDetailProps {
  areaId: string;
  activoId: string;
}

export function ActivoDetail({ areaId, activoId }: ActivoDetailProps) {
  const [editing, setEditing] = useState(false);

  const { data: activo, isLoading, isError, error, refetch } = useActivo(
    areaId,
    activoId
  );

  const handleFormSuccess = () => {
    setEditing(false);
    void refetch();
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando activo…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  if (!activo) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        No se encontró el activo.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
        {editing ? (
          <>
            <h2 className="mb-4 text-lg font-semibold">Editar activo</h2>
            <ActivoForm
              areaId={areaId}
              activo={activo}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditing(false)}
            />
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {activo.nombre}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600"
              >
                Editar
              </button>
            </div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-500">Tipo</dt>
                <dd className="text-sm">{TIPO_LABELS[activo.tipo]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Estado</dt>
                <dd className="text-sm">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      activo.status === "activo"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : activo.status === "inactivo"
                          ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          : activo.status === "suspendido"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {STATUS_LABELS[activo.status]}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">
                  Propietario
                </dt>
                <dd className="text-sm">
                  {activo.Propietario?.name ?? activo.propietarioId}
                </dd>
              </div>
              {activo.descripcion && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-slate-500">
                    Descripción
                  </dt>
                  <dd className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {activo.descripcion}
                  </dd>
                </div>
              )}
            </dl>
          </>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
        <RequisitosSection areaId={areaId} activoId={activoId} />
      </div>
    </div>
  );
}
