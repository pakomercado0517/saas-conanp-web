"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Loader2, ArrowLeft, Pencil } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCurrentUserMembership } from "@/features/memberships/hooks/useCurrentUserMembership";
import { usePrestador } from "../hooks/usePrestador";
import { PrestadorEditDialog } from "./PrestadorEditDialog";
import type { PrestadorStatus } from "../types";

const STATUS_LABELS: Record<PrestadorStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  suspendido: "Suspendido",
};

interface PrestadorDetailProps {
  areaId: string;
  prestadorId: string;
}

export function PrestadorDetail({ areaId, prestadorId }: PrestadorDetailProps) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const { role } = useCurrentUserMembership(areaId);
  const { data: prestador, isLoading, isError, error, statusCode } = usePrestador(
    areaId,
    prestadorId
  );
  const [showEditDialog, setShowEditDialog] = useState(false);

  const listHref = getDashboardHref(areaId, "/prestadores");
  const isOwnPrestador = prestador && userId && prestador.userId === userId;
  const canView =
    role === "admin" ||
    role === "gestor" ||
    role === "observador" ||
    isOwnPrestador;
  const canEdit = canView && (role === "admin" || role === "gestor" || isOwnPrestador);
  const canEditStatus = role === "admin" || role === "gestor";

  if (isLoading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center p-8">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Cargando prestador…
        </p>
      </div>
    );
  }

  if (isError || statusCode === 403 || statusCode === 404) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <p className="text-sm text-red-600 dark:text-red-400">
          {statusCode === 403
            ? "No tienes permiso para ver este prestador."
            : statusCode === 404
              ? "Prestador no encontrado."
              : getApiErrorMessage(error)}
        </p>
        <Link
          href={listHref}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:underline dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver al listado
        </Link>
      </div>
    );
  }

  if (!prestador) {
    return (
      <p className="p-4 text-sm text-slate-500">
        No se encontró el prestador.
      </p>
    );
  }

  if (!canView) {
    router.replace(listHref);
    return null;
  }

  const displayName =
    prestador.name ?? prestador.User?.name ?? prestador.userId ?? "—";
  const displayEmail =
    prestador.email ?? prestador.User?.email ?? "—";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={listHref}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Volver al listado"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Perfil del prestador
          </h1>
        </div>
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

      <p className="text-sm text-slate-500">
        <Link href={listHref} className="underline hover:no-underline">
          Volver al listado de prestadores
        </Link>
      </p>

      <PrestadorEditDialog
        prestador={prestador}
        areaId={areaId}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSuccess={() => setShowEditDialog(false)}
        canEditStatus={canEditStatus}
      />
    </div>
  );
}
