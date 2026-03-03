"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { usePermisos } from "../hooks/usePermisos";
import { useDeletePermiso } from "../hooks/useDeletePermiso";
import { PermisoForm } from "./PermisoForm";
import type { Permiso, PermisoStatus } from "../types";

const STATUS_LABELS: Record<PermisoStatus, string> = {
  vigente: "Vigente",
  vencido: "Vencido",
  revocado: "Revocado",
  pendiente: "Pendiente",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function getPrestadorName(p: Permiso): string {
  return p.Prestador?.name ?? p.Prestador?.email ?? p.prestadorId;
}

function getActividadName(p: Permiso): string {
  return p.Actividad?.name ?? p.actividadId;
}

interface PermisosListProps {
  areaId: string;
}

export function PermisosList({ areaId }: PermisosListProps) {
  const [prestadorFilter, setPrestadorFilter] = useState("");
  const [actividadFilter, setActividadFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PermisoStatus | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editingPermiso, setEditingPermiso] = useState<Permiso | null>(null);

  const { data: permisos, isLoading, isError, error, refetch } = usePermisos(
    areaId,
    {
      prestadorId: prestadorFilter || undefined,
      actividadId: actividadFilter || undefined,
      status: statusFilter || undefined,
    }
  );
  const deleteMutation = useDeletePermiso(areaId);

  const handleDelete = async (permiso: Permiso) => {
    if (!confirm("¿Eliminar este permiso?")) return;
    try {
      await deleteMutation.mutateAsync(permiso.id);
    } catch {
      // Error manejado por mutation
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPermiso(null);
    void refetch();
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando permisos…</p>;
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
          <input
            type="text"
            placeholder="Filtrar por prestador (ID)"
            value={prestadorFilter}
            onChange={(e) => setPrestadorFilter(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            placeholder="Filtrar por actividad (ID)"
            value={actividadFilter}
            onChange={(e) => setActividadFilter(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PermisoStatus | "")}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Todos los estados</option>
            {(Object.keys(STATUS_LABELS) as PermisoStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingPermiso(null);
            setShowForm(true);
          }}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
        >
          Nuevo permiso
        </button>
      </div>

      {(showForm || editingPermiso) && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {editingPermiso ? "Editar permiso" : "Crear permiso"}
          </h3>
          <PermisoForm
            areaId={areaId}
            permiso={editingPermiso ?? undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingPermiso(null);
            }}
          />
        </div>
      )}

      {!permisos?.length ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          No hay permisos en esta área.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Prestador
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Actividad
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Vigencia
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
              {permisos.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-sm text-slate-800 dark:text-slate-100">
                    {getPrestadorName(p)}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                    {getActividadName(p)}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(p.vigenciaDesde)} – {formatDate(p.vigenciaHasta)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        p.status === "vigente"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : p.status === "vencido"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : p.status === "revocado"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPermiso(p);
                          setShowForm(false);
                        }}
                        className="text-sm font-medium text-(--cyan-accent) hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
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
