"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Loader2, Pencil } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { useCurrentUserMembership } from "@/features/memberships/hooks/useCurrentUserMembership";
import { usePrestadoresAggregatedForDependencia } from "../hooks/usePrestadoresAggregatedForDependencia";
import { useResolvePrestadorArea } from "../hooks/useResolvePrestadorArea";
import { PrestadorEditDialog } from "./PrestadorEditDialog";
import { PrestadorActivosSection } from "./PrestadorActivosSection";
import { PrestadorPermisosSection } from "./PrestadorPermisosSection";
import type { PrestadorStatus } from "../types";

const STATUS_LABELS: Record<PrestadorStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  suspendido: "Suspendido",
};

interface PrestadorDependenciaDetailProps {
  dependenciaId: string;
  prestadorId: string;
  areaIdHint: string | null;
}

export function PrestadorDependenciaDetail({
  dependenciaId,
  prestadorId,
  areaIdHint,
}: PrestadorDependenciaDetailProps) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const { areas } = useDependenciaContext();
  const areaIds = useMemo(() => areas.map((a) => a.id), [areas]);

  const { resolvedAreaId, prestador, isLoading: resolving, isNotFound } =
    useResolvePrestadorArea(areaIds, prestadorId, areaIdHint);

  const { role } = useCurrentUserMembership(resolvedAreaId ?? "");
  const { aggregated, refetch: refetchAggregated } =
    usePrestadoresAggregatedForDependencia(dependenciaId, areas);

  const [showEditDialog, setShowEditDialog] = useState(false);

  const row = useMemo(() => {
    if (!prestador) return null;
    return aggregated.find(
      (r) =>
        r.userId === prestador.userId ||
        r.entries.some((e) => e.prestadorId === prestadorId)
    );
  }, [aggregated, prestador, prestadorId]);

  const permisoBindings = useMemo(() => {
    if (!row) return [];
    return row.entries.map((e) => ({
      areaId: e.areaId,
      areaName: e.areaName,
      prestadorId: e.prestadorId,
    }));
  }, [row]);

  const activosBindings = useMemo(() => {
    if (permisoBindings.length > 0) return permisoBindings;
    if (resolvedAreaId && prestadorId) {
      const areaName =
        areas.find((a) => a.id === resolvedAreaId)?.name ?? "Área";
      return [
        {
          areaId: resolvedAreaId,
          areaName,
          prestadorId,
        },
      ];
    }
    return [];
  }, [permisoBindings, resolvedAreaId, prestadorId, areas]);

  const isOwnPrestador = prestador && userId && prestador.userId === userId;
  const canView =
    role === "admin" ||
    role === "gestor" ||
    role === "observador" ||
    Boolean(isOwnPrestador);
  const canEdit =
    canView &&
    (role === "admin" || role === "gestor" || Boolean(isOwnPrestador));
  const canEditStatus = role === "admin" || role === "gestor";

  if (resolving) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center p-8">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Cargando prestador…
        </p>
      </div>
    );
  }

  if (isNotFound || !prestador || !resolvedAreaId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          {isNotFound
            ? "Prestador no encontrado en las áreas de esta dependencia."
            : "No se pudo cargar el prestador."}
        </p>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          No tienes permiso para ver este prestador.
        </p>
      </div>
    );
  }

  const displayName =
    prestador.name ?? prestador.User?.name ?? prestador.userId ?? "—";
  const displayEmail =
    prestador.email ?? prestador.User?.email ?? "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        {canEdit && (
          <button
            type="button"
            onClick={() => setShowEditDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-4 py-2 text-sm font-semibold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Editar
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-(--cyan-accent)/20">
            <User className="h-7 w-7 text-(--cyan-accent)" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nombre
              </p>
              <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
                {displayName}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Correo electrónico
              </p>
              <p className="text-slate-700 dark:text-slate-300">{displayEmail}</p>
            </div>
            {prestador.phone != null && prestador.phone !== "" && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Teléfono
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  {prestador.phone}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Estado
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                {STATUS_LABELS[prestador.status]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {activosBindings.length > 0 && (
        <PrestadorActivosSection
          dependenciaId={dependenciaId}
          bindings={activosBindings}
          prestadorDisplayName={displayName}
        />
      )}

      {permisoBindings.length > 0 && (
        <PrestadorPermisosSection
          dependenciaId={dependenciaId}
          bindings={permisoBindings}
        />
      )}

      {canEdit && (
        <PrestadorEditDialog
          prestador={prestador}
          areaId={resolvedAreaId}
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          canEditStatus={canEditStatus}
          onSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: ["prestador"] });
            void refetchAggregated();
          }}
        />
      )}
    </div>
  );
}
