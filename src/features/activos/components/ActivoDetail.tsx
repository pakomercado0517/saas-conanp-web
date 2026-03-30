"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { useActivo } from "../hooks/useActivo";
import { useActivoNombre } from "../hooks/useActivoNombre";
import { ActivoForm } from "./ActivoForm";
import { RequisitosSection } from "./RequisitosSection";
import type { ActivoTipo, ActivoStatus } from "../types";

const TIPO_LABELS: Record<ActivoTipo, string> = {
  embarcacion: "Embarcación",
  vehiculo: "Vehículo",
  guia: "Guía",
  equipo: "Equipo",
};

const STATUS_LABELS: Record<ActivoStatus, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  suspendido: "Suspendido",
};

function labelTipo(t: ActivoTipo): string {
  return TIPO_LABELS[t] ?? t;
}

interface ActivoDetailProps {
  areaId: string;
  activoId: string;
}

export function ActivoDetail({ areaId, activoId }: ActivoDetailProps) {
  const { role } = useAreaContext();
  const isAdmin = role === "admin";
  const [editing, setEditing] = useState(false);

  const { data: activo, isLoading, isError, error, refetch } = useActivo(
    areaId,
    activoId
  );
  const { nombre: nombreDesdeRequisito, isLoading: nombreRequisitoLoading } =
    useActivoNombre(areaId, activoId);

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

  const tituloActivo =
    activo.nombre?.trim() ||
    (!nombreRequisitoLoading ? nombreDesdeRequisito?.trim() : null) ||
    null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
        {editing ? (
          <>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Editar activo
            </h2>
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
                {nombreRequisitoLoading && !activo.nombre?.trim()
                  ? "…"
                  : tituloActivo ?? "Sin nombre"}
              </h2>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/80"
                >
                  Editar
                </button>
              )}
            </div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tipo
                </dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">
                  {labelTipo(activo.type)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Estado
                </dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      activo.status === "aprobado"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : activo.status === "rechazado"
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
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Propietario
                </dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">
                  {activo.Propietario?.name?.trim() ||
                    activo.Propietario?.id ||
                    (activo.ownerId ? activo.ownerId : "—")}
                </dd>
              </div>
              {activo.descripcion && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
        <RequisitosSection
          areaId={areaId}
          activoId={activoId}
          activoTipo={activo.type}
        />
      </div>
    </div>
  );
}
