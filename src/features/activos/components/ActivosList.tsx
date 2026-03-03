"use client";

import Link from "next/link";
import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EmptyState } from "@/shared/components/EmptyState";
import { useActivos } from "../hooks/useActivos";
import { useDeleteActivo } from "../hooks/useDeleteActivo";
import { ActivoForm } from "./ActivoForm";
import type { Activo, ActivoTipo, ActivoStatus } from "../types";

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

function getPropietarioName(a: Activo): string {
  return a.Propietario?.name ?? a.propietarioId;
}

interface ActivosListProps {
  areaId: string;
}

export function ActivosList({ areaId }: ActivosListProps) {
  const [tipoFilter, setTipoFilter] = useState<ActivoTipo | "">("");
  const [statusFilter, setStatusFilter] = useState<ActivoStatus | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editingActivo, setEditingActivo] = useState<Activo | null>(null);

  const { data: activos, isLoading, isError, error, refetch } = useActivos(
    areaId,
    {
      tipo: tipoFilter || undefined,
      status: statusFilter || undefined,
    }
  );
  const deleteMutation = useDeleteActivo(areaId);

  const handleDelete = async (activo: Activo) => {
    if (!confirm("¿Eliminar este activo?")) return;
    try {
      await deleteMutation.mutateAsync(activo.id);
    } catch {
      // Error manejado
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingActivo(null);
    void refetch();
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando activos…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <select
            id="activos-filtro-tipo"
            aria-label="Filtrar por tipo"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value as ActivoTipo | "")}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Todos los tipos</option>
            {(Object.keys(TIPO_LABELS) as ActivoTipo[]).map((t) => (
              <option key={t} value={t}>
                {TIPO_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            id="activos-filtro-estado"
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ActivoStatus | "")}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Todos los estados</option>
            {(Object.keys(STATUS_LABELS) as ActivoStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingActivo(null);
            setShowForm(true);
          }}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:bg-slate-200 dark:text-slate-900 dark:focus-visible:ring-slate-400"
        >
          Nuevo activo
        </button>
      </div>

      {(showForm || editingActivo) && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {editingActivo ? "Editar activo" : "Crear activo"}
          </h3>
          <ActivoForm
            areaId={areaId}
            activo={editingActivo ?? undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingActivo(null);
            }}
          />
        </div>
      )}

      {!activos?.length ? (
        <EmptyState
          message="No hay activos en esta área. Registra vehículos, equipos o infraestructura."
          action={{
            label: "Nuevo activo",
            onClick: () => {
              setEditingActivo(null);
              setShowForm(true);
            },
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Tipo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Propietario
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Estado
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
              {activos.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 text-sm">
                    <Link
                      href={getDashboardHref(areaId, `/activos/${a.id}`)}
                      className="font-medium text-slate-800 hover:underline dark:text-slate-100"
                    >
                      {a.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                    {TIPO_LABELS[a.tipo]}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                    {getPropietarioName(a)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        a.status === "activo"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : a.status === "inactivo"
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                            : a.status === "suspendido"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Link
                        href={getDashboardHref(areaId, `/activos/${a.id}`)}
                        className="text-sm font-medium text-(--cyan-accent) hover:underline"
                      >
                        Ver
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingActivo(a);
                          setShowForm(false);
                        }}
                        className="text-sm font-medium text-(--cyan-accent) hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a)}
                        disabled={deleteMutation.isPending}
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
