"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import { usePrestadoresActivosCountsForAggregated } from "../hooks/usePrestadoresActivosCountsForAggregated";
import { usePrestadoresAggregatedForDependencia } from "../hooks/usePrestadoresAggregatedForDependencia";
import { getPrestadorStatusLabel } from "../lib/prestador-status";
import { CreatePrestadorSheet } from "./CreatePrestadorSheet";
import type { AggregatedPrestadorRow } from "../lib/aggregate-prestadores-for-dependencia";

function labelActivosCount(n: number): string {
  if (n === 1) return "1 activo";
  return `${n} activos`;
}

function pickEntryForRow(
  row: AggregatedPrestadorRow,
  tableFilterAreaId: string
): NonNullable<AggregatedPrestadorRow["entries"][number]> {
  if (tableFilterAreaId) {
    const match = row.entries.find((e) => e.areaId === tableFilterAreaId);
    if (match) return match;
  }
  return row.entries[0]!;
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

  const [tableFilterAreaId, setTableFilterAreaId] = useState<string>("");

  const { summaryForRow } = usePrestadoresActivosCountsForAggregated(
    aggregated,
    tableFilterAreaId
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [createAreaId, setCreateAreaId] = useState<string>("");

  const filteredAggregated = useMemo(() => {
    if (!tableFilterAreaId) return aggregated;
    return aggregated.filter((row) =>
      row.entries.some((e) => e.areaId === tableFilterAreaId)
    );
  }, [aggregated, tableFilterAreaId]);

  const adminAreas = useMemo(
    () => areas.filter((a) => rolesByAreaId.get(a.id) === "admin"),
    [areas, rolesByAreaId]
  );

  const defaultCreateAreaId = adminAreas[0]?.id ?? "";
  /** ANP que va en la URL de `crear-completo`; vacío en estado = opción «todas» → primera ANP admin. */
  const effectiveCreateAreaId =
    createAreaId !== "" ? createAreaId : defaultCreateAreaId;

  useEffect(() => {
    if (
      createAreaId !== "" &&
      !adminAreas.some((a) => a.id === createAreaId)
    ) {
      setCreateAreaId("");
    }
  }, [createAreaId, adminAreas]);

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
          <div className="flex max-w-md flex-col gap-1">
            <label
              htmlFor="prestador-area-alta"
              className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400"
            >
              Área para el alta
            </label>
            <select
              id="prestador-area-alta"
              value={
                createAreaId === "" ||
                adminAreas.some((a) => a.id === createAreaId)
                  ? createAreaId
                  : ""
              }
              onChange={(e) => setCreateAreaId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">
                Todas las áreas de la dependencia
              </option>
              {adminAreas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              «Todas las áreas» usa la primera ANP donde eres administrador en la
              ruta de la API. Si eliges una ANP, esa organización define
              ecosistema y activos del formulario. Que el prestador aparezca en
              varias ANP depende del servidor, no solo de esta lista.
            </p>
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
        <>
          <div className="mb-4 flex flex-col gap-1 sm:max-w-xs">
            <label
              htmlFor="prestadores-tabla-filtro-area"
              className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400"
            >
              Filtrar por área
            </label>
            <select
              id="prestadores-tabla-filtro-area"
              value={tableFilterAreaId}
              onChange={(e) => setTableFilterAreaId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">Todas las áreas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          {filteredAggregated.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No hay prestadores registrados en el área seleccionada.
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
              {filteredAggregated.map((row) => {
                const primary = pickEntryForRow(row, tableFilterAreaId);
                const href = `/dependencias/${dependenciaId}/prestadores/${
                  primary.prestadorId
                }?areaId=${encodeURIComponent(primary.areaId)}`;
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
        </>
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
