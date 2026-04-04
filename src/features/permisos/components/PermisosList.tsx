"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/types/api";
import { formatDate } from "@/shared/lib/date";
import { EmptyState } from "@/shared/components/EmptyState";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { usePrestadores } from "@/features/prestadores/hooks/usePrestadores";
import { useActividades } from "../hooks/useActividades";
import { usePermisosPorPrestador } from "../hooks/usePermisos";
import { permisosByOrganizationKey } from "../hooks/permisosQueryKeys";
import { PermisoForm } from "./PermisoForm";
import type { Permiso, PermisoStatus } from "../types";

const STATUS_LABELS: Record<PermisoStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  vencido: "Vencido",
  suspendido: "Suspendido",
};

const PAGE_SIZE = 20;

function getPrestadorName(p: Permiso): string {
  return p.Prestador?.name ?? p.Prestador?.email ?? p.prestadorId;
}

function getActividadName(p: Permiso): string {
  return p.Actividad?.name ?? p.actividadId;
}

interface PermisosListProps {
  areaId: string;
  /** Prestador preseleccionado (p. ej. desde `?prestadorId=`). */
  initialPrestadorId?: string;
  /** Muestra enlace al índice sin query. */
  showBackToIndex?: boolean;
}

export function PermisosList({
  areaId,
  initialPrestadorId,
  showBackToIndex = false,
}: PermisosListProps) {
  const { role } = useAreaContext();
  const queryClient = useQueryClient();
  const isAdmin = role === "admin";
  const isPrestadorRole = role === "prestador";

  const [selectedPrestadorId, setSelectedPrestadorId] = useState(
    () => initialPrestadorId ?? ""
  );
  const [actividadFilter, setActividadFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PermisoStatus | "">("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingPermiso, setEditingPermiso] = useState<Permiso | null>(null);

  const {
    data: prestadores,
    isLoading: prestadoresLoading,
    isError: prestadoresError,
    error: prestadoresErr,
  } = usePrestadores(areaId);
  const { data: actividades } = useActividades(areaId);

  /** ID efectivo para el API: prestador con un solo perfil no debe esperar estado async. */
  const effectivePrestadorId = useMemo(() => {
    if (isPrestadorRole && prestadores?.length === 1) {
      return selectedPrestadorId || prestadores[0].id;
    }
    return selectedPrestadorId;
  }, [isPrestadorRole, prestadores, selectedPrestadorId]);

  const listParams = useMemo(
    () => ({
      prestadorId: effectivePrestadorId,
      page,
      limit: PAGE_SIZE,
      actividadId: actividadFilter || undefined,
      status: statusFilter || undefined,
    }),
    [effectivePrestadorId, page, actividadFilter, statusFilter]
  );

  const {
    data: permisos,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  } = usePermisosPorPrestador(areaId, listParams);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPermiso(null);
    void refetch();
    void queryClient.invalidateQueries({
      queryKey: permisosByOrganizationKey(areaId),
    });
  };

  const prestadorOptions = prestadores ?? [];
  const showPrestadorSelector = !isPrestadorRole || prestadorOptions.length > 1;

  if (prestadoresLoading) {
    return <p className="text-sm text-slate-500">Cargando prestadores…</p>;
  }

  if (prestadoresError && prestadoresErr) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(prestadoresErr)}
      </p>
    );
  }

  if (isPrestadorRole && prestadorOptions.length === 0) {
    return (
      <EmptyState message="No se encontró un perfil de prestador asociado a tu cuenta en esta área." />
    );
  }

  if (!effectivePrestadorId) {
    return (
      <div className="space-y-4">
        {showPrestadorSelector ? (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Selecciona un prestador para ver y filtrar sus permisos por actividad.
            </p>
            <div>
              <label htmlFor="permisos-prestador" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Prestador
              </label>
              <select
                id="permisos-prestador"
                value={selectedPrestadorId}
                onChange={(e) => {
                  setSelectedPrestadorId(e.target.value);
                  setPage(1);
                }}
                className="w-full max-w-md rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Selecciona un prestador</option>
                {prestadorOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ?? p.User?.name ?? p.email ?? p.id}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <EmptyState message="No se encontró un perfil de prestador asociado a tu cuenta en esta área." />
        )}
      </div>
    );
  }

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

  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  return (
    <div className="space-y-4">
      {showBackToIndex ? (
        <div>
          <Link
            href={getDashboardHref(areaId, "/permisos")}
            className="text-sm font-medium text-(--cyan-accent) hover:underline"
          >
            Volver al listado de prestadores
          </Link>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {showPrestadorSelector && (
            <select
              id="permisos-prestador-inline"
              aria-label="Prestador"
              value={
                isPrestadorRole && prestadorOptions.length === 1
                  ? prestadorOptions[0].id
                  : selectedPrestadorId
              }
              onChange={(e) => {
                setSelectedPrestadorId(e.target.value);
                setPage(1);
              }}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Selecciona un prestador</option>
              {prestadorOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.User?.name ?? p.email ?? p.id}
                </option>
              ))}
            </select>
          )}
          {actividades && actividades.length > 0 ? (
            <select
              id="permisos-filtro-actividad"
              aria-label="Filtrar por actividad"
              value={actividadFilter}
              onChange={(e) => {
                setActividadFilter(e.target.value);
                setPage(1);
              }}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Todas las actividades</option>
              {actividades.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="permisos-filtro-actividad"
              aria-label="Filtrar por actividad (ID)"
              placeholder="ID actividad (opcional)"
              value={actividadFilter}
              onChange={(e) => {
                setActividadFilter(e.target.value);
                setPage(1);
              }}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          )}
          <select
            id="permisos-filtro-estado"
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PermisoStatus | "");
              setPage(1);
            }}
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
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setEditingPermiso(null);
              setShowForm(true);
            }}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:bg-slate-200 dark:text-slate-900 dark:focus-visible:ring-slate-400"
          >
            Nuevo permiso
          </button>
        )}
      </div>

      {(showForm || editingPermiso) && isAdmin && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {editingPermiso ? "Editar permiso" : "Crear permiso"}
          </h3>
          <PermisoForm
            areaId={areaId}
            permiso={editingPermiso ?? undefined}
            defaultPrestadorId={editingPermiso ? undefined : effectivePrestadorId}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingPermiso(null);
            }}
          />
        </div>
      )}

      {!permisos?.length ? (
        <EmptyState
          message="No hay permisos para este prestador con los filtros actuales."
          action={
            isAdmin
              ? {
                  label: "Nuevo permiso",
                  onClick: () => {
                    setEditingPermiso(null);
                    setShowForm(true);
                  },
                }
              : undefined
          }
        />
      ) : (
        <>
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
                    Alcance
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Vigencia
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Estado
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                      Acciones
                    </th>
                  )}
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
                      {p.appliesToAllAreas ? (
                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                          Todas las áreas
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          Esta área
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(p.vigenciaDesde)} – {formatDate(p.vigenciaHasta)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          p.status === "activo"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : p.status === "vencido"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : p.status === "suspendido"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-2">
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
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>
                Página {pagination?.page ?? page} de {totalPages}
                {total > 0 ? ` · ${total} registro${total === 1 ? "" : "s"}` : ""}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50 dark:border-slate-600"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50 dark:border-slate-600"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
