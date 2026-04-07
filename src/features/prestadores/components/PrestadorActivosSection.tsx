"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { buildActivoDependenciaDetailHref } from "@/features/activos/lib/activo-dependencia-routes";
import { useAlertDialog } from "@/shared/components/AlertDialogProvider";
import { getApiErrorMessage } from "@/shared/types/api";
import { AreaContextProvider } from "@/features/organizations/context/AreaContext";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import {
  deleteActivo,
  listActivosOwnedByPrestador,
} from "@/features/activos/services/activos.api";
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

function ActivoNombreCell({
  areaId,
  activoId,
  fallbackNombre,
}: {
  areaId: string;
  activoId: string;
  /** Desde el listado del activo; el backend puede enviarlo sin depender del requisito `nombre`. */
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

  const manageableBindings = useMemo(
    () => bindings.filter((b) => canManageInArea(b.areaId)),
    [bindings, canManageInArea]
  );

  const altaContextBinding = useMemo(
    (): PrestadorPermisosAreaBinding | null =>
      manageableBindings[0] ?? null,
    [manageableBindings]
  );

  /** Un solo contexto de API: el listado es el mismo a nivel de dependencia; la ruta usa una ANP para permisos. */
  const listContextBinding = useMemo(
    (): PrestadorPermisosAreaBinding | null =>
      manageableBindings[0] ?? bindings[0] ?? null,
    [manageableBindings, bindings]
  );

  const {
    data: activosList = [],
    isLoading: loadingActivos,
    isError,
    error: activosError,
  } = useQuery({
    queryKey: listContextBinding
      ? prestadorActivosOwnedQueryKey(
          listContextBinding.areaId,
          listContextBinding.prestadorId
        )
      : (["prestador-activos-owned", "disabled"] as const),
    queryFn: () =>
      listActivosOwnedByPrestador(
        listContextBinding!.areaId,
        listContextBinding!.prestadorId
      ),
    enabled: Boolean(listContextBinding && !rolesLoading),
  });

  const sortedActivos = useMemo(
    () => [...activosList].sort((a, b) => a.id.localeCompare(b.id, "es")),
    [activosList]
  );

  const [showWizard, setShowWizard] = useState(false);
  const [wizardAreaBinding, setWizardAreaBinding] =
    useState<PrestadorPermisosAreaBinding | null>(null);
  const alertDialog = useAlertDialog();

  const canManageAny = manageableBindings.length > 0;

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

  if (!listContextBinding) {
    return null;
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/40">
      <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
        Activos del prestador
      </h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Los activos se registran a nivel de dependencia: el mismo registro aplica
        a todas las ANP de esta dependencia. El identificador de organización en
        la API solo define el contexto de permisos y resolución en el servidor;
        no significa que el activo quede guardado solo para una ANP. Aquí
        administras los activos y requisitos asociados a este prestador.
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
      ) : isError && activosError ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {getApiErrorMessage(activosError)}
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

          {!sortedActivos.length ? (
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
                      title="El activo pertenece a la dependencia; no queda restringido a una sola ANP en base de datos."
                    >
                      Ámbito
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                  {sortedActivos.map((activo) => (
                    <ActivoTableRow
                      key={activo.id}
                      activo={activo}
                      dependenciaId={dependenciaId}
                      areaId={listContextBinding.areaId}
                      prestadorId={listContextBinding.prestadorId}
                      canDelete={canManageInArea(listContextBinding.areaId)}
                      alertDialog={alertDialog}
                      onDeleted={invalidateActivos}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showWizard && wizardAreaBinding ? (
        <AreaContextProvider areaId={wizardAreaBinding.areaId}>
          <CreateActivoWizard
            open={showWizard}
            areaId={wizardAreaBinding.areaId}
            onClose={handleCloseWizard}
            fixedOwnerPrestadorId={wizardAreaBinding.prestadorId}
            fixedOwnerDisplayName={prestadorDisplayName}
            requisitosCatalogoHref={`/dependencias/${dependenciaId}/requisitos-catalogo`}
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

interface ActivoTableRowProps {
  activo: Activo;
  dependenciaId: string;
  areaId: string;
  prestadorId: string;
  canDelete: boolean;
  onDeleted: () => void;
  alertDialog: ReturnType<typeof useAlertDialog>;
}

function ActivoTableRow({
  activo,
  dependenciaId,
  areaId,
  prestadorId,
  canDelete,
  onDeleted,
  alertDialog,
}: ActivoTableRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const detailHref = buildActivoDependenciaDetailHref(
    dependenciaId,
    prestadorId,
    areaId,
    activo.id
  );

  const handleDelete = async () => {
    if (!canDelete) return;
    const confirmed = await alertDialog.confirm({
      title: "Eliminar activo",
      description:
        "¿Eliminar este activo? Esta acción no se puede deshacer.",
      cancelLabel: "Cancelar",
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const message = await deleteActivo(areaId, activo.id);
      alertDialog.open({
        title: "Activo eliminado",
        description: message ?? "El activo se eliminó correctamente.",
      });
      onDeleted();
    } catch {
      // Error manejado por capas inferiores
    } finally {
      setIsDeleting(false);
    }
  };

  const statusLabel = activo.status;

  return (
    <tr>
      <td className="px-4 py-2 text-sm">
        <Link
          href={detailHref}
          className="font-medium text-slate-800 hover:underline dark:text-slate-100"
        >
          <ActivoNombreCell
            areaId={areaId}
            activoId={activo.id}
            fallbackNombre={activo.nombre}
          />
        </Link>
      </td>
      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
        {TIPO_LABELS[activo.type]}
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
          className="text-sm"
          title="Ámbito de dependencia; visible desde cualquier ANP de esta dependencia según permisos."
        >
          Dependencia
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
          {canDelete ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
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
