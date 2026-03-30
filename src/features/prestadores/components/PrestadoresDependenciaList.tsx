"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import { usePrestadoresActivosCountsForAggregated } from "../hooks/usePrestadoresActivosCountsForAggregated";
import { usePrestadoresAggregatedForDependencia } from "../hooks/usePrestadoresAggregatedForDependencia";
import { getPrestadorStatusLabel } from "../lib/prestador-status";
import { CreatePrestadorSheet } from "./CreatePrestadorSheet";

function labelActivosCount(n: number): string {
  if (n === 1) return "1 activo";
  return `${n} activos`;
}

interface PrestadoresDependenciaListProps {
  dependenciaId: string;
}

export function PrestadoresDependenciaList({
  dependenciaId,
}: PrestadoresDependenciaListProps) {
  const { areas } = useDependenciaContext();
  const areaIds = areas.map((a) => a.id);
  const { rolesByAreaId, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  const { aggregated, isLoading, errors, refetch } =
    usePrestadoresAggregatedForDependencia(dependenciaId, areas);

  const { summaryForRow } = usePrestadoresActivosCountsForAggregated(aggregated);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [createAreaId, setCreateAreaId] = useState<string>("");

  const adminAreas = areas.filter((a) => rolesByAreaId.get(a.id) === "admin");

  const defaultCreateAreaId = adminAreas[0]?.id ?? "";
  const effectiveCreateAreaId = createAreaId || defaultCreateAreaId;

  const canCreateInSomeArea = areaIds.some(
    (id) => rolesByAreaId.get(id) === "admin"
  );

  if (rolesLoading || isLoading) {
    return <p className="text-sm text-slate-500">Cargando prestadores…</p>;
  }

  if (errors.length > 0 && aggregated.length === 0) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(errors[0])}
      </p>
    );
  }

  if (areas.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Aún no hay áreas en esta dependencia. Crea un área para registrar
        prestadores.
      </p>
    );
  }

  return (
    <>
      {canCreateInSomeArea && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
          <Link
            href={`/dependencias/${dependenciaId}/prestadores/nuevo`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Formulario completo
          </Link>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="prestador-area-alta"
              className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400"
            >
              Área para el alta
            </label>
            <select
              id="prestador-area-alta"
              value={effectiveCreateAreaId}
              onChange={(e) => setCreateAreaId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              {adminAreas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--cyan-accent) px-4 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
          >
            Crear prestador
          </button>
        </div>
      )}

      {errors.length > 0 && aggregated.length > 0 && (
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
          Algunas áreas no pudieron cargarse: revisa tu acceso en cada ANP.
        </p>
      )}

      {aggregated.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Aún no hay prestadores registrados en las áreas de esta dependencia.
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
                  Correo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Estado
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Activos
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
              {aggregated.map((row) => {
                const first = row.entries[0];
                const href = `/dependencias/${dependenciaId}/prestadores/${
                  first.prestadorId
                }?areaId=${encodeURIComponent(first.areaId)}`;
                const { total: activosTotal, isLoading: activosLoading } =
                  summaryForRow(row);
                return (
                  <tr key={row.userId}>
                    <td className="px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                      <Link href={href} className="hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                      {row.email}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                      {getPrestadorStatusLabel(row.status)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                      {activosLoading ? (
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Loader2
                            className="size-4 shrink-0 animate-spin"
                            aria-hidden
                          />
                          <span className="sr-only">Cargando activos…</span>
                        </span>
                      ) : (
                        <Link
                          href={href}
                          className="tabular-nums hover:underline"
                          title="Ir al detalle para ver y gestionar activos"
                        >
                          {labelActivosCount(activosTotal)}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={href}
                        className="text-sm font-medium text-(--cyan-accent) hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {canCreateInSomeArea && (
        <CreatePrestadorSheet
          areaId={effectiveCreateAreaId}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSuccess={() => {
            void refetch();
          }}
        />
      )}
    </>
  );
}
