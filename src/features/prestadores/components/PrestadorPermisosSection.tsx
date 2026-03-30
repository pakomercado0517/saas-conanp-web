"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { ApiError } from "@/shared/types/api";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import { listActividades } from "@/features/activities/services/activities.api";
import {
  listPermisos,
  createPermiso,
} from "@/features/permisos/services/permisos.api";
import type { Actividad } from "@/features/activities/types";
import { PRESTADORES_DEPENDENCIA_QUERY_KEY } from "../hooks/usePrestadoresAggregatedForDependencia";

const ACTIVITY_QUERY_KEY = ["activities", "dependencia-permisos"] as const;

export interface PrestadorPermisosAreaBinding {
  areaId: string;
  areaName: string;
  prestadorId: string;
}

interface ActivityRow {
  key: string;
  areaId: string;
  areaName: string;
  actividad: Actividad;
  prestadorId: string;
}

interface PrestadorPermisosSectionProps {
  dependenciaId: string;
  bindings: PrestadorPermisosAreaBinding[];
}

function makeRowKey(areaId: string, actividadId: string): string {
  return `${areaId}:${actividadId}`;
}

export function PrestadorPermisosSection({
  dependenciaId,
  bindings,
}: PrestadorPermisosSectionProps) {
  const queryClient = useQueryClient();
  const areaIds = useMemo(() => bindings.map((b) => b.areaId), [bindings]);
  const prestadorByArea = useMemo(() => {
    const m = new Map<string, string>();
    for (const b of bindings) {
      m.set(b.areaId, b.prestadorId);
    }
    return m;
  }, [bindings]);

  const { rolesByAreaId, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  const canManageInArea = useCallback(
    (areaId: string): boolean => {
      const r = rolesByAreaId.get(areaId);
      return r === "admin" || r === "gestor";
    },
    [rolesByAreaId]
  );

  const actividadesQueries = useQueries({
    queries: bindings.map((b) => {
      const r = rolesByAreaId.get(b.areaId);
      const can = r === "admin" || r === "gestor";
      return {
        queryKey: [...ACTIVITY_QUERY_KEY, b.areaId],
        queryFn: async () => {
          const res = await listActividades(b.areaId, { limit: 100 });
          return res.data;
        },
        enabled: Boolean(b.areaId && !rolesLoading && can),
      };
    }),
  });

  const existingPermisosQueries = useQueries({
    queries: bindings.map((b) => {
      const r = rolesByAreaId.get(b.areaId);
      const can = r === "admin" || r === "gestor";
      return {
        queryKey: ["permisos", "prestador-existing", b.areaId, b.prestadorId],
        queryFn: async () => {
          const res = await listPermisos(b.areaId, {
            prestadorId: b.prestadorId,
            limit: 100,
          });
          return res.data;
        },
        enabled: Boolean(b.areaId && b.prestadorId && !rolesLoading && can),
      };
    }),
  });

  const rows: ActivityRow[] = useMemo(() => {
    const out: ActivityRow[] = [];
    bindings.forEach((b, index) => {
      if (!canManageInArea(b.areaId)) return;
      const acts = actividadesQueries[index]?.data ?? [];
      const pid = prestadorByArea.get(b.areaId);
      if (!pid) return;
      for (const act of acts) {
        out.push({
          key: makeRowKey(b.areaId, act.id),
          areaId: b.areaId,
          areaName: b.areaName,
          actividad: act,
          prestadorId: pid,
        });
      }
    });
    return out.sort((a, b) => {
      const byArea = a.areaName.localeCompare(b.areaName, "es");
      if (byArea !== 0) return byArea;
      return a.actividad.name.localeCompare(b.actividad.name, "es");
    });
  }, [bindings, actividadesQueries, canManageInArea, prestadorByArea]);

  const existingActividadKeys = useMemo(() => {
    const set = new Set<string>();
    bindings.forEach((b, index) => {
      const perms = existingPermisosQueries[index]?.data ?? [];
      for (const p of perms) {
        set.add(makeRowKey(b.areaId, p.actividadId));
      }
    });
    return set;
  }, [bindings, existingPermisosQueries]);

  const [filterAreaId, setFilterAreaId] = useState<string>("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [vigenciaDesde, setVigenciaDesde] = useState<string>("");
  const [vigenciaHasta, setVigenciaHasta] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<
    Array<{ key: string; message: string }>
  >([]);
  const [submitOk, setSubmitOk] = useState(0);

  const filteredRows = useMemo(() => {
    if (!filterAreaId) return rows;
    return rows.filter((r) => r.areaId === filterAreaId);
  }, [rows, filterAreaId]);

  const loadingActivities = actividadesQueries.some((q) => q.isLoading);
  const loadingPermisos = existingPermisosQueries.some((q) => q.isLoading);

  const manageableAreaCount = bindings.filter((b) =>
    canManageInArea(b.areaId)
  ).length;

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedKeys);
    for (const r of filteredRows) {
      if (!existingActividadKeys.has(r.key)) {
        next.add(r.key);
      }
    }
    setSelectedKeys(next);
  };

  const clearSelection = () => setSelectedKeys(new Set());

  const selectedRows = useMemo(
    () => rows.filter((r) => selectedKeys.has(r.key)),
    [rows, selectedKeys]
  );

  const handleConfirmSubmit = async () => {
    setSubmitErrors([]);
    setSubmitOk(0);
    if (selectedRows.length === 0) {
      setSubmitErrors([
        {
          key: "_",
          message: "Selecciona al menos una actividad o revisa los filtros.",
        },
      ]);
      return;
    }
    if (!vigenciaDesde || !vigenciaHasta) {
      setSubmitErrors([
        {
          key: "_",
          message: "Indica vigencia desde y hasta.",
        },
      ]);
      return;
    }
    setIsSubmitting(true);
    const errors: Array<{ key: string; message: string }> = [];
    let ok = 0;
    for (const r of selectedRows) {
      if (existingActividadKeys.has(r.key)) {
        errors.push({
          key: r.key,
          message: `Ya existe un permiso para «${r.actividad.name}» en ${r.areaName}. Omite o revoca el existente.`,
        });
        continue;
      }
      try {
        await createPermiso(r.areaId, {
          prestadorId: r.prestadorId,
          actividadId: r.actividad.id,
          vigenciaDesde,
          vigenciaHasta,
          status: "activo",
          appliesToAllAreas: false,
        });
        ok += 1;
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : getApiErrorMessage(e) ?? "Error al crear permiso.";
        errors.push({ key: r.key, message: msg });
      }
    }
    setSubmitOk(ok);
    setSubmitErrors(errors);
    setIsSubmitting(false);
    setShowConfirm(false);
    clearSelection();
    void queryClient.invalidateQueries({
      queryKey: [...PRESTADORES_DEPENDENCIA_QUERY_KEY, dependenciaId],
    });
    for (const b of bindings) {
      void queryClient.invalidateQueries({
        queryKey: ["permisos", "prestador-existing", b.areaId, b.prestadorId],
      });
    }
  };

  const handleReviewClick = () => {
    setSubmitErrors([]);
    setSubmitOk(0);
    if (selectedRows.length === 0) {
      setSubmitErrors([
        {
          key: "_",
          message: "Selecciona al menos una actividad o revisa los filtros.",
        },
      ]);
      return;
    }
    if (!vigenciaDesde || !vigenciaHasta) {
      setSubmitErrors([
        {
          key: "_",
          message: "Indica vigencia desde y hasta.",
        },
      ]);
      return;
    }
    setShowConfirm(true);
  };

  if (manageableAreaCount === 0) {
    return (
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/40">
        <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          Permisos por actividad
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No tienes permisos de administración o gestión en las áreas de este
          prestador. Los permisos solo pueden asignarlos un administrador o
          gestor del área correspondiente.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/40">
      <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
        Permisos por actividad
      </h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Selecciona actividades por área y define una vigencia común. Se creará
        un permiso por cada actividad seleccionada (varias solicitudes al
        servidor).
      </p>

      {rolesLoading || loadingActivities || loadingPermisos ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Cargando actividades y permisos existentes…
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label
                htmlFor="perm-filter-area"
                className="mb-1 block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400"
              >
                Filtrar por área
              </label>
              <select
                id="perm-filter-area"
                value={filterAreaId}
                onChange={(e) => setFilterAreaId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Todas las áreas</option>
                {bindings
                  .filter((b) => canManageInArea(b.areaId))
                  .map((b) => (
                    <option key={b.areaId} value={b.areaId}>
                      {b.areaName}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="perm-vigencia-desde"
                className="mb-1 block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400"
              >
                Vigencia desde
              </label>
              <input
                id="perm-vigencia-desde"
                type="date"
                value={vigenciaDesde}
                onChange={(e) => setVigenciaDesde(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label
                htmlFor="perm-vigencia-hasta"
                className="mb-1 block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400"
              >
                Vigencia hasta
              </label>
              <input
                id="perm-vigencia-hasta"
                type="date"
                value={vigenciaHasta}
                onChange={(e) => setVigenciaHasta(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <button
              type="button"
              onClick={selectAllFiltered}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:text-slate-200"
            >
              Seleccionar todas en esta lista
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Limpiar selección
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-600">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Incluir
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Área
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Actividad
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/20">
                {filteredRows.map((r) => {
                  const hasExisting = existingActividadKeys.has(r.key);
                  const checked = selectedKeys.has(r.key);
                  return (
                    <tr key={r.key}>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={hasExisting}
                          onChange={() => toggleKey(r.key)}
                          aria-label={`Seleccionar ${r.actividad.name} en ${r.areaName}`}
                        />
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-800 dark:text-slate-200">
                        {r.areaName}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-800 dark:text-slate-200">
                        {r.actividad.name}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {hasExisting ? "Ya tiene permiso" : "Disponible"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">
              No hay actividades en las áreas donde puedes gestionar permisos.
            </p>
          )}

          {showConfirm && (
            <div
              className="mt-6 rounded-lg border border-(--cyan-accent)/40 bg-(--cyan-accent)/5 p-4"
              role="region"
              aria-label="Resumen antes de guardar"
            >
              <p className="font-semibold text-(--navy-deep) dark:text-white">
                Resumen
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-slate-700 dark:text-slate-300">
                <li>Permisos a crear: {selectedRows.length}</li>
                <li>
                  Vigencia: {vigenciaDesde || "—"} → {vigenciaHasta || "—"}
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-4 py-2 text-sm font-bold text-(--navy-deep) disabled:opacity-60"
                >
                  {isSubmitting && (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  )}
                  Confirmar y enviar
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  Editar selección
                </button>
              </div>
            </div>
          )}

          {!showConfirm && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleReviewClick}
                className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-4 py-2.5 text-sm font-bold text-(--navy-deep) hover:bg-(--cyan-hover)"
              >
                Revisar y guardar permisos
              </button>
              <span className="text-sm text-slate-500">
                Seleccionadas: {selectedRows.length}
              </span>
            </div>
          )}

          {submitOk > 0 && (
            <p
              className="mt-4 text-sm text-emerald-700 dark:text-emerald-400"
              role="status"
            >
              Se crearon correctamente {submitOk} permiso
              {submitOk === 1 ? "" : "s"}.
            </p>
          )}
          {submitErrors.length > 0 && (
            <ul
              className="mt-4 list-inside list-disc space-y-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {submitErrors.map((e) => (
                <li key={`${e.key}-${e.message}`}>{e.message}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
