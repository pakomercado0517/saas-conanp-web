"use client";

import Link from "next/link";
import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAlertDialog } from "@/shared/components/AlertDialogProvider";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { useActivos } from "../hooks/useActivos";
import { useDeleteActivo } from "../hooks/useDeleteActivo";
import { useActivoNombre } from "../hooks/useActivoNombre";
import { ActivoForm } from "./ActivoForm";
import { CreateActivoWizard } from "./CreateActivoWizard";
import { RequisitosSection } from "./RequisitosSection";
import type { Activo, ActivoTipo, ActivoStatus } from "../types";

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

function getPropietarioName(a: Activo): string {
  return a.Propietario?.name ?? a.ownerId;
}

function ActivoNombreCell({
  areaId,
  activoId,
  fallbackNombre,
}: {
  areaId: string;
  activoId: string;
  fallbackNombre?: string | null;
}) {
  const { nombre, isLoading } = useActivoNombre(areaId, activoId, {
    fallbackNombre,
  });
  if (isLoading && !nombre) {
    return <span className="text-slate-400">—</span>;
  }
  return <span>{nombre ?? "Sin nombre"}</span>;
}

interface ActivosListProps {
  areaId: string;
}

export function ActivosList({ areaId }: ActivosListProps) {
  const { role } = useAreaContext();
  const isAdmin = role === "admin";
  const [tipoFilter, setTipoFilter] = useState<ActivoTipo | "">("");
  const [statusFilter, setStatusFilter] = useState<ActivoStatus | "">("");
  const [showWizard, setShowWizard] = useState(false);
  const [editingActivo, setEditingActivo] = useState<Activo | null>(null);
  const alertDialog = useAlertDialog();

  const { data: activos, isLoading, isError, error, refetch } = useActivos(
    areaId,
    {
      tipo: tipoFilter || undefined,
      status: statusFilter || undefined,
    }
  );
  const deleteMutation = useDeleteActivo(areaId);

  const handleDelete = async (activo: Activo) => {
    const confirmed = await alertDialog.confirm({
      title: "Eliminar activo",
      description: "¿Eliminar este activo? Esta acción no se puede deshacer.",
      cancelLabel: "Cancelar",
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!confirmed) return;
    try {
      const message = await deleteMutation.mutateAsync(activo.id);
      alertDialog.open({
        title: "Activo eliminado",
        description: message ?? "El activo se eliminó correctamente.",
      });
    } catch {
      // Error manejado
    }
  };

  const handleFormSuccess = () => {
    setShowWizard(false);
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
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setEditingActivo(null);
              setShowWizard(true);
            }}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:bg-slate-200 dark:text-slate-900 dark:focus-visible:ring-slate-400"
          >
            Nuevo activo
          </button>
        )}
      </div>

      {showWizard && (
        <CreateActivoWizard
          open={showWizard}
          areaId={areaId}
          onClose={() => setShowWizard(false)}
          onCompleted={() => {
            handleFormSuccess();
          }}
        />
      )}

      {editingActivo && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Editar activo
            </h3>
            <ActivoForm
              areaId={areaId}
              activo={editingActivo}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingActivo(null)}
            />
          </div>
          {editingActivo && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
              <RequisitosSection
                areaId={areaId}
                activoId={editingActivo.id}
                activoTipo={editingActivo.type}
              />
            </div>
          )}
        </div>
      )}

      {!activos?.length ? (
        <EmptyState
          message="No hay activos en esta área. Registra vehículos, equipos o infraestructura."
          action={
            isAdmin
              ? {
                  label: "Nuevo activo",
                  onClick: () => {
                    setEditingActivo(null);
                    setShowWizard(true);
                  },
                }
              : undefined
          }
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
                      <ActivoNombreCell
                        areaId={areaId}
                        activoId={a.id}
                        fallbackNombre={a.nombre}
                      />
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                    {TIPO_LABELS[a.type]}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                    {getPropietarioName(a)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        a.status === "aprobado"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : a.status === "rechazado"
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
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingActivo(a);
                              setShowWizard(false);
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
                        </>
                      )}
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
