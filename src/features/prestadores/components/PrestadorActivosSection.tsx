"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useAlertDialog } from "@/shared/components/AlertDialogProvider";
import { getApiErrorMessage } from "@/shared/types/api";
import { AreaContextProvider } from "@/features/organizations/context/AreaContext";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import { listActivosOwnedByPrestador } from "@/features/activos/services/activos.api";
import { useDeleteActivo } from "@/features/activos/hooks/useDeleteActivo";
import { useActivoNombre } from "@/features/activos/hooks/useActivoNombre";
import { CreateActivoWizard } from "@/features/activos/components/CreateActivoWizard";
import { prestadorActivosOwnedQueryKey } from "@/features/activos/constants/prestadorActivosQueryKeys";
import type { Activo, ActivoStatus, ActivoTipo } from "@/features/activos/types";
import type { PrestadorPermisosAreaBinding } from "./PrestadorPermisosSection";

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

function buildActivoDetailHref(
  areaId: string,
  activoId: string,
  dependenciaId: string,
  prestadorId: string
): string {
  const base = getDashboardHref(areaId, `/activos/${activoId}`);
  const q = new URLSearchParams({
    dependenciaId,
    prestadorId,
    areaId,
  });
  return `${base}?${q.toString()}`;
}

function ActivoNombreCell({
  areaId,
  activoId,
}: {
  areaId: string;
  activoId: string;
}) {
  const { nombre, isLoading } = useActivoNombre(areaId, activoId);
  if (isLoading) return <span className="text-slate-400">—</span>;
  return <span>{nombre ?? "Sin nombre"}</span>;
}

interface ActivoRow {
  areaId: string;
  areaName: string;
  prestadorId: string;
  activo: Activo;
}

interface PrestadorActivosSectionProps {
  dependenciaId: string;
  bindings: PrestadorPermisosAreaBinding[];
  /** Nombre para mostrar en el wizard cuando el propietario está fijado. */
  prestadorDisplayName: string;
}

export function PrestadorActivosSection({
  dependenciaId,
  bindings,
  prestadorDisplayName,
}: PrestadorActivosSectionProps) {
  const queryClient = useQueryClient();
  const areaIds = useMemo(() => bindings.map((b) => b.areaId), [bindings]);
  const { rolesByAreaId, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  const canManageInArea = useCallback(
    (areaId: string): boolean => {
      const r = rolesByAreaId.get(areaId);
      return r === "admin" || r === "gestor";
    },
    [rolesByAreaId]
  );

  const activosQueries = useQueries({
    queries: bindings.map((b) => ({
      queryKey: prestadorActivosOwnedQueryKey(b.areaId, b.prestadorId),
      queryFn: async () =>
        listActivosOwnedByPrestador(b.areaId, b.prestadorId),
      enabled: Boolean(b.areaId && b.prestadorId && !rolesLoading),
    })),
  });

  const [filterAreaId, setFilterAreaId] = useState<string>("");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardBinding, setWizardBinding] =
    useState<PrestadorPermisosAreaBinding | null>(null);
  const alertDialog = useAlertDialog();

  const rows: ActivoRow[] = useMemo(() => {
    const out: ActivoRow[] = [];
    bindings.forEach((b, index) => {
      const list = activosQueries[index]?.data ?? [];
      for (const activo of list) {
        out.push({
          areaId: b.areaId,
          areaName: b.areaName,
          prestadorId: b.prestadorId,
          activo,
        });
      }
    });
    return out.sort((a, b) => {
      const byArea = a.areaName.localeCompare(b.areaName, "es");
      if (byArea !== 0) return byArea;
      return a.activo.id.localeCompare(b.activo.id, "es");
    });
  }, [bindings, activosQueries]);

  const filteredRows = useMemo(() => {
    if (!filterAreaId) return rows;
    return rows.filter((r) => r.areaId === filterAreaId);
  }, [rows, filterAreaId]);

  const targetBindingForAlta = useMemo((): PrestadorPermisosAreaBinding | null => {
    if (bindings.length === 0) return null;
    if (bindings.length === 1) {
      const b = bindings[0];
      if (!b) return null;
      return canManageInArea(b.areaId) ? b : null;
    }
    if (filterAreaId) {
      const b = bindings.find((x) => x.areaId === filterAreaId);
      if (!b) return null;
      return canManageInArea(b.areaId) ? b : null;
    }
    return null;
  }, [bindings, filterAreaId, canManageInArea]);

  const canManageAny = useMemo(
    () => bindings.some((b) => canManageInArea(b.areaId)),
    [bindings, canManageInArea]
  );

  const loadingActivos = activosQueries.some((q) => q.isLoading);
  const errorQuery = activosQueries.find((q) => q.isError);

  const invalidateActivos = useCallback(() => {
    for (const b of bindings) {
      void queryClient.invalidateQueries({
        queryKey: prestadorActivosOwnedQueryKey(b.areaId, b.prestadorId),
      });
    }
  }, [bindings, queryClient]);

  const handleOpenWizard = () => {
    if (!targetBindingForAlta) return;
    setWizardBinding(targetBindingForAlta);
    setShowWizard(true);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setWizardBinding(null);
  };

  if (bindings.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/40">
      <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
        Activos del prestador
      </h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Patrimonio operativo asociado a este prestador en la dependencia. El
        alcance de permisos por ANP se gestiona en la sección de permisos; aquí
        solo se administran los activos y sus requisitos.
      </p>

      {!canManageAny ? (
        <p className="mb-4 text-sm text-amber-800 dark:text-amber-200/90">
          Solo puedes consultar este listado; no tienes permisos para registrar
          o eliminar activos.
        </p>
      ) : null}

      {rolesLoading || loadingActivos ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Cargando activos…
        </p>
      ) : errorQuery?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {getApiErrorMessage(errorQuery.error)}
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label
                htmlFor="activos-filter-area"
                className="mb-1 block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400"
              >
                Acotar vista (organización)
              </label>
              <select
                id="activos-filter-area"
                value={filterAreaId}
                onChange={(e) => setFilterAreaId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Todas las organizaciones</option>
                {bindings.map((b) => (
                  <option key={b.areaId} value={b.areaId}>
                    {b.areaName}
                  </option>
                ))}
              </select>
            </div>
            {canManageAny ? (
              <button
                type="button"
                disabled={!targetBindingForAlta}
                title={
                  !targetBindingForAlta
                    ? bindings.length > 1 && !filterAreaId
                      ? "Selecciona una organización en el filtro para indicar dónde registrar el activo"
                      : "No tienes permisos para registrar activos en la organización seleccionada"
                    : undefined
                }
                onClick={handleOpenWizard}
                className="inline-flex items-center rounded-lg bg-(--cyan-accent) px-4 py-2 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:cursor-not-allowed disabled:opacity-50"
              >
                Registrar activo
              </button>
            ) : null}
          </div>

          {!filteredRows.length ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No hay activos que coincidan con el filtro o aún no hay registros
              para este prestador.
            </p>
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
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                  {filteredRows.map((row) => (
                    <ActivoRowActions
                      key={`${row.areaId}:${row.activo.id}`}
                      row={row}
                      dependenciaId={dependenciaId}
                      canManage={canManageInArea(row.areaId)}
                      onDeleted={invalidateActivos}
                      alertDialog={alertDialog}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showWizard && wizardBinding ? (
        <AreaContextProvider areaId={wizardBinding.areaId}>
          <CreateActivoWizard
            open={showWizard}
            areaId={wizardBinding.areaId}
            onClose={handleCloseWizard}
            fixedOwnerPrestadorId={wizardBinding.prestadorId}
            fixedOwnerDisplayName={prestadorDisplayName}
            onCompleted={() => {
              invalidateActivos();
              handleCloseWizard();
            }}
          />
        </AreaContextProvider>
      ) : null}
    </section>
  );
}

interface ActivoRowActionsProps {
  row: ActivoRow;
  dependenciaId: string;
  canManage: boolean;
  onDeleted: () => void;
  alertDialog: ReturnType<typeof useAlertDialog>;
}

function ActivoRowActions({
  row,
  dependenciaId,
  canManage,
  onDeleted,
  alertDialog,
}: ActivoRowActionsProps) {
  const { areaId, prestadorId, activo } = row;
  const deleteMutation = useDeleteActivo(areaId);
  const detailHref = buildActivoDetailHref(
    areaId,
    activo.id,
    dependenciaId,
    prestadorId
  );

  const handleDelete = async () => {
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
      onDeleted();
    } catch {
      // Error manejado por capas inferiores / toast si aplica
    }
  };

  return (
    <tr>
      <td className="px-4 py-2 text-sm">
        <Link
          href={detailHref}
          className="font-medium text-slate-800 hover:underline dark:text-slate-100"
        >
          <ActivoNombreCell areaId={areaId} activoId={activo.id} />
        </Link>
      </td>
      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
        {TIPO_LABELS[activo.type]}
      </td>
      <td className="px-4 py-2 text-sm">
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
      </td>
      <td className="px-4 py-2">
        <div className="flex flex-wrap gap-2">
          <Link
            href={detailHref}
            className="text-sm font-medium text-(--cyan-accent) hover:underline"
          >
            Ver
          </Link>
          {canManage && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleteMutation.isPending}
              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
            >
              Eliminar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
