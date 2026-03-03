"use client";

import Link from "next/link";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { usePrestadores } from "../hooks/usePrestadores";
import type { Prestador, PrestadorStatus } from "../types";

const STATUS_LABELS: Record<PrestadorStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  suspendido: "Suspendido",
};

function getDisplayName(p: Prestador): string {
  return p.name ?? p.User?.name ?? p.email ?? p.User?.email ?? p.userId ?? "—";
}

function getDisplayEmail(p: Prestador): string {
  return p.email ?? p.User?.email ?? "—";
}

interface PrestadoresListProps {
  areaId: string;
}

export function PrestadoresList({ areaId }: PrestadoresListProps) {
  const { role } = useAreaContext();
  const { data: prestadores, isLoading, isError, error } = usePrestadores(areaId);

  const canEdit = role === "admin" || role === "gestor" || role === "prestador";
  const canViewDetail = canEdit || role === "observador";

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando prestadores…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  if (!prestadores?.length) {
    return (
      <EmptyState
        message="No hay prestadores en esta área. Invita usuarios con rol de prestador para comenzar."
        action={
          canEdit
            ? {
                label: "Invitar usuario",
                href: getDashboardHref(areaId, "/usuarios"),
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Nombre
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Correo
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Estado
            </th>
            {canViewDetail && (
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
          {prestadores.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2 text-sm">
                <Link
                  href={getDashboardHref(areaId, `/prestadores/${p.id}`)}
                  className="font-medium text-slate-800 hover:underline dark:text-slate-100"
                >
                  {getDisplayName(p)}
                </Link>
              </td>
              <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                {getDisplayEmail(p)}
              </td>
              <td className="px-4 py-2 text-sm">{STATUS_LABELS[p.status]}</td>
              {canViewDetail && (
                <td className="px-4 py-2">
                  <Link
                    href={getDashboardHref(areaId, `/prestadores/${p.id}`)}
                    className="text-sm font-medium text-(--cyan-accent) hover:underline"
                  >
                    Ver
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
