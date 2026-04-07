"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { buildActivoDependenciaDetailHref } from "@/features/activos/lib/activo-dependencia-routes";
import { useAlertDialog } from "@/shared/components/AlertDialogProvider";
import { getApiErrorMessage } from "@/shared/types/api";
import { AreaContextProvider } from "@/features/organizations/context/AreaContext";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import { findNombreFromRequisitos } from "@/features/activos/lib/activo-nombre-from-requisitos";
import {
  deleteActivo,
  listActivosOwnedByPrestador,
} from "@/features/activos/services/activos.api";
import { listRequisitos } from "@/features/activos/services/requisitos.api";
import { useActivoNombre } from "@/features/activos/hooks/useActivoNombre";
import {
  CreateActivoWizard,
  type ActivoParallelRegistroTarget,
} from "@/features/activos/components/CreateActivoWizard";
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

const ACTIVO_STATUS_ORDER: Record<ActivoStatus, number> = {
  rechazado: 0,
  suspendido: 1,
  pendiente: 2,
  aprobado: 3,
};

function worstActivoStatus(statuses: ActivoStatus[]): ActivoStatus {
  const [head, ...tail] = statuses;
  if (head == null) return "pendiente";
  return tail.reduce(
    (worst, s) =>
      ACTIVO_STATUS_ORDER[s] < ACTIVO_STATUS_ORDER[worst] ? s : worst,
    head
  );
}

const NOMBRE_REQUISITO_QUERY_KEY = ["activo-nombre-requisito"] as const;

function activoRowKey(row: ActivoRow): string {
  return `${row.areaId}:${row.activo.id}`;
}

/**
 * Identifica el mismo activo lógico en varias ANP: nombre (requisito o campo),
 * o misma marca de tiempo de creación (alta multi-área), o fila única.
 */
function buildActivoLogicalGroupKey(
  row: ActivoRow,
  nombreFromRequisito: string | null | undefined,
  nombreRequisitoPendiente: boolean
): string {
  const n = (
    nombreFromRequisito?.trim() ||
    row.activo.nombre?.trim() ||
    ""
  ).toLowerCase();
  if (n) {
    return `${row.activo.type}::name::${n}`;
  }
  if (nombreRequisitoPendiente) {
    return `singleton::${row.areaId}::${row.activo.id}`;
  }
  /** Misma fecha (día) + tipo: suele coincidir con altas multi-área el mismo día sin requisito nombre. */
  const day = row.activo.createdAt?.slice(0, 10);
  if (day) {
    return `${row.activo.type}::day::${day}`;
  }
  return `singleton::${row.areaId}::${row.activo.id}`;
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
    (id: string): boolean => {
      const r = rolesByAreaId.get(id);
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

  const [showWizard, setShowWizard] = useState(false);
  const [wizardAreaBinding, setWizardAreaBinding] =
    useState<PrestadorPermisosAreaBinding | null>(null);
  const [areasDetailMembers, setAreasDetailMembers] = useState<
    ActivoRow[] | null
  >(null);
  const alertDialog = useAlertDialog();

  const manageableBindings = useMemo(
    () => bindings.filter((b) => canManageInArea(b.areaId)),
    [bindings, canManageInArea]
  );

  const altaContextBinding = useMemo(
    (): PrestadorPermisosAreaBinding | null =>
      manageableBindings[0] ?? null,
    [manageableBindings]
  );

  const parallelRegistroTargets: ActivoParallelRegistroTarget[] | undefined =
    useMemo(() => {
      if (manageableBindings.length <= 1) return undefined;
      return manageableBindings.map((b) => ({
        areaId: b.areaId,
        prestadorId: b.prestadorId,
        areaName: b.areaName,
      }));
    }, [manageableBindings]);

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

  const nombreQueries = useQueries({
    queries: rows.map((row) => ({
      queryKey: [
        ...NOMBRE_REQUISITO_QUERY_KEY,
        row.areaId,
        row.activo.id,
      ] as const,
      queryFn: async () => {
        const reqs = await listRequisitos(row.areaId, row.activo.id);
        return findNombreFromRequisitos(reqs);
      },
      enabled: Boolean(row.areaId && row.activo.id && !rolesLoading),
    })),
  });

  const rowIndexByKey = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r, i) => {
      m.set(activoRowKey(r), i);
    });
    return m;
  }, [rows]);

  const groupedRowData = useMemo(() => {
    const map = new Map<string, ActivoRow[]>();
    rows.forEach((row, i) => {
      const q = nombreQueries[i];
      const fromReq = q?.data ?? null;
      const pending = Boolean(q?.isLoading);
      const key = buildActivoLogicalGroupKey(row, fromReq, pending);
      const arr = map.get(key) ?? [];
      arr.push(row);
      map.set(key, arr);
    });

    const groups = Array.from(map.values()).map((members) =>
      [...members].sort((a, b) =>
        a.areaName.localeCompare(b.areaName, "es")
      )
    );

    return groups.map((members) => {
      let displayNombre: string | null = null;
      for (const m of members) {
        const idx = rowIndexByKey.get(activoRowKey(m));
        if (idx == null) continue;
        const q = nombreQueries[idx];
        const t = q?.data ?? m.activo.nombre?.trim() ?? null;
        if (t) {
          displayNombre = t;
          break;
        }
      }
      return { members, displayNombre };
    });
  }, [rows, nombreQueries, rowIndexByKey]);

  const canManageAny = manageableBindings.length > 0;

  const loadingActivos = activosQueries.some((q) => q.isLoading);
  const errorQuery = activosQueries.find((q) => q.isError);
  const loadingNombres =
    rows.length > 0 && nombreQueries.some((q) => q.isLoading);

  const invalidateActivos = useCallback(() => {
    for (const b of bindings) {
      void queryClient.invalidateQueries({
        queryKey: prestadorActivosOwnedQueryKey(b.areaId, b.prestadorId),
      });
    }
  }, [bindings, queryClient]);

  const handleOpenWizard = () => {
    if (!altaContextBinding) return;
    setWizardAreaBinding(altaContextBinding);
    setShowWizard(true);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setWizardAreaBinding(null);
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
      ) : loadingNombres ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Preparando listado…
        </p>
      ) : errorQuery?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {getApiErrorMessage(errorQuery.error)}
        </p>
      ) : (
        <>
          {canManageAny ? (
            <div className="mb-4 flex flex-wrap items-end justify-end gap-4">
              <button
                type="button"
                disabled={!altaContextBinding}
                title={
                  !altaContextBinding
                    ? "No tienes permisos para registrar activos en ninguna ANP de este listado"
                    : undefined
                }
                onClick={handleOpenWizard}
                className="inline-flex items-center rounded-lg bg-(--cyan-accent) px-4 py-2 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:cursor-not-allowed disabled:opacity-50"
              >
                Registrar activo
              </button>
            </div>
          ) : null}

          {!rows.length ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Aún no hay activos registrados para este prestador.
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
                    <th
                      className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300"
                      title="Número de ANP donde está registrado el activo"
                    >
                      Áreas
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                  {groupedRowData.map(({ members, displayNombre }) => (
                    <ActivoGroupedRow
                      key={members
                        .map((m) => `${m.areaId}:${m.activo.id}`)
                        .join("|")}
                      members={members}
                      displayNombre={displayNombre}
                      dependenciaId={dependenciaId}
                      canManageInArea={canManageInArea}
                      onOpenAreasDetail={setAreasDetailMembers}
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

      {areasDetailMembers && areasDetailMembers.length > 0 ? (
        <ActivosAreasDetailModal
          rows={areasDetailMembers}
          dependenciaId={dependenciaId}
          onClose={() => setAreasDetailMembers(null)}
        />
      ) : null}

      {showWizard && wizardAreaBinding ? (
        <AreaContextProvider areaId={wizardAreaBinding.areaId}>
          <CreateActivoWizard
            open={showWizard}
            areaId={wizardAreaBinding.areaId}
            onClose={handleCloseWizard}
            fixedOwnerPrestadorId={wizardAreaBinding.prestadorId}
            fixedOwnerDisplayName={prestadorDisplayName}
            requisitosCatalogoHref={`/dependencias/${dependenciaId}/requisitos-catalogo`}
            parallelRegistroTargets={parallelRegistroTargets}
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

interface ActivoGroupedRowProps {
  members: ActivoRow[];
  displayNombre: string | null;
  dependenciaId: string;
  canManageInArea: (areaId: string) => boolean;
  onOpenAreasDetail: (rows: ActivoRow[]) => void;
  onDeleted: () => void;
  alertDialog: ReturnType<typeof useAlertDialog>;
}

function ActivoGroupedRow({
  members,
  displayNombre,
  dependenciaId,
  canManageInArea,
  onOpenAreasDetail,
  onDeleted,
  alertDialog,
}: ActivoGroupedRowProps) {
  const first = members[0];
  if (!first) return null;

  const [isDeleting, setIsDeleting] = useState(false);
  const areaCount = members.length;
  const statusLabel = worstActivoStatus(
    members.map((m) => m.activo.status)
  );
  const manageableMembers = members.filter((m) =>
    canManageInArea(m.areaId)
  );

  const singleHref = buildActivoDependenciaDetailHref(
    dependenciaId,
    first.prestadorId,
    first.areaId,
    first.activo.id
  );

  const handleDeleteGroup = async () => {
    if (manageableMembers.length === 0) return;
    const confirmed = await alertDialog.confirm({
      title:
        manageableMembers.length === 1
          ? "Eliminar activo"
          : "Eliminar activo en varias áreas",
      description:
        manageableMembers.length === 1
          ? "¿Eliminar este activo? Esta acción no se puede deshacer."
          : `Se eliminarán ${manageableMembers.length} registro(s) del activo en distintas áreas. Esta acción no se puede deshacer.`,
      cancelLabel: "Cancelar",
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      for (const m of manageableMembers) {
        const message = await deleteActivo(m.areaId, m.activo.id);
        if (manageableMembers.length === 1) {
          alertDialog.open({
            title: "Activo eliminado",
            description: message ?? "El activo se eliminó correctamente.",
          });
        }
      }
      if (manageableMembers.length > 1) {
        alertDialog.open({
          title: "Activos eliminados",
          description: "Se completaron las eliminaciones solicitadas.",
        });
      }
      onDeleted();
    } catch {
      // Error manejado por capas inferiores
    } finally {
      setIsDeleting(false);
    }
  };

  const nombreCell = displayNombre ? (
    <span className="font-medium text-slate-800 dark:text-slate-100">
      {displayNombre}
    </span>
  ) : (
    <span className="font-medium text-slate-800 dark:text-slate-100">
      <ActivoNombreCell areaId={first.areaId} activoId={first.activo.id} />
    </span>
  );

  return (
    <tr>
      <td className="px-4 py-2 text-sm">
        {areaCount === 1 ? (
          <Link
            href={singleHref}
            className="text-slate-800 hover:underline dark:text-slate-100"
          >
            {nombreCell}
          </Link>
        ) : (
          nombreCell
        )}
      </td>
      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
        {TIPO_LABELS[first.activo.type]}
      </td>
      <td className="px-4 py-2 text-sm">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            statusLabel === "aprobado"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : statusLabel === "rechazado"
                ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                : statusLabel === "suspendido"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          {STATUS_LABELS[statusLabel]}
        </span>
      </td>
      <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
        <span
          className="tabular-nums text-base font-semibold"
          title={`Registrado en ${areaCount} ${areaCount === 1 ? "área" : "áreas"}`}
        >
          {areaCount}
        </span>
      </td>
      <td className="px-4 py-2">
        <div className="flex flex-wrap gap-2">
          {areaCount === 1 ? (
            <Link
              href={singleHref}
              className="text-sm font-medium text-(--cyan-accent) hover:underline"
            >
              Ver
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAreasDetail(members)}
              className="text-sm font-medium text-(--cyan-accent) hover:underline"
            >
              Ver
            </button>
          )}
          {manageableMembers.length > 0 ? (
            <button
              type="button"
              onClick={() => void handleDeleteGroup()}
              disabled={isDeleting}
              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
            >
              Eliminar
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

interface ActivosAreasDetailModalProps {
  rows: ActivoRow[];
  dependenciaId: string;
  onClose: () => void;
}

function ActivosAreasDetailModal({
  rows,
  dependenciaId,
  onClose,
}: ActivosAreasDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activos-areas-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative max-h-[min(80vh,520px)] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>
        <h3
          id="activos-areas-detail-title"
          className="pr-10 text-lg font-bold text-slate-900 dark:text-slate-100"
        >
          Activo en {rows.length}{" "}
          {rows.length === 1 ? "área" : "áreas"}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Abre el detalle en cada ANP para ver requisitos y estado del registro.
        </p>
        <ul className="mt-4 space-y-2">
          {rows.map((r) => {
            const href = buildActivoDependenciaDetailHref(
              dependenciaId,
              r.prestadorId,
              r.areaId,
              r.activo.id
            );
            return (
              <li key={`${r.areaId}:${r.activo.id}`}>
                <Link
                  href={href}
                  className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-(--cyan-accent) hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800/50"
                >
                  {r.areaName}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
