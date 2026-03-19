"use client";

import type { Resolver } from "react-hook-form";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { useRequisitos } from "../hooks/useRequisitos";
import { useActivoRequisitoCatalogo } from "../hooks/useActivoRequisitoCatalogo";
import {
  useCreateRequisito,
  useUpdateRequisito,
  useDeleteRequisito,
  useAprobarRequisito,
  useRechazarRequisito,
  useSuspenderRequisito,
} from "../hooks/useRequisitoMutations";
import {
  activoTipoToTipoActivoCatalogo,
  type ActivoRequisito,
  type ActivoRequisitoCatalogoItem,
  type ActivoTipo,
} from "../types";

interface RequisitosSectionProps {
  areaId: string;
  activoId: string;
  activoTipo: ActivoTipo;
}

const inputClass =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

function buildRequisitosFormSchema(catalog: ActivoRequisitoCatalogoItem[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const item of catalog) {
    const valueSchema = item.requerido
      ? z.string().min(1, `${item.label ?? item.key} es requerido`)
      : z.string();
    const docSchema = item.requiereDocumento
      ? z.union([z.string().min(1, "Documento es requerido"), z.literal("")])
      : z.union([z.string(), z.literal("")]).optional();
    shape[item.key] = z.object({
      value: valueSchema,
      documentUrl: docSchema,
    });
  }
  return z.object(shape);
}

type RequisitosFormData = Record<
  string,
  { value: string; documentUrl?: string }
>;

function sortCatalog(catalog: ActivoRequisitoCatalogoItem[]) {
  return [...catalog].sort(
    (a, b) => a.orden - b.orden || a.key.localeCompare(b.key)
  );
}

export function RequisitosSection({
  areaId,
  activoId,
  activoTipo,
}: RequisitosSectionProps) {
  const { role } = useAreaContext();
  const isAdmin = role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [rechazarMotivo, setRechazarMotivo] = useState("");
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);

  const { dependenciaId } = useAreaContext();
  const tipoActivo = activoTipoToTipoActivoCatalogo(activoTipo);
  const { data: catalog, isLoading: catalogLoading } = useActivoRequisitoCatalogo(areaId, {
    dependenciaId: dependenciaId ?? undefined,
  });
  const { data: requisitos, isLoading: reqLoading, isError, error, refetch } =
    useRequisitos(areaId, activoId);
  const createMutation = useCreateRequisito(areaId, activoId);
  const updateMutation = useUpdateRequisito(areaId, activoId);
  const deleteMutation = useDeleteRequisito(areaId, activoId);
  const aprobarMutation = useAprobarRequisito(areaId, activoId);
  const rechazarMutation = useRechazarRequisito(areaId, activoId);
  const suspenderMutation = useSuspenderRequisito(areaId, activoId);

  const sortedCatalog = useMemo(
    () =>
      catalog
        ? sortCatalog(
            catalog.filter(
              (c) => c.activo && c.tipoActivo === tipoActivo
            )
          )
        : [],
    [catalog, tipoActivo]
  );

  const requisitoByKey = useMemo(() => {
    const map = new Map<string, ActivoRequisito>();
    for (const r of requisitos ?? []) {
      map.set(r.clave, r);
    }
    return map;
  }, [requisitos]);

  const schema = useMemo(
    () => (sortedCatalog.length ? buildRequisitosFormSchema(sortedCatalog) : null),
    [sortedCatalog]
  );

  const defaultValues = useMemo(() => {
    const values: RequisitosFormData = {};
    for (const item of sortedCatalog) {
      const req = requisitoByKey.get(item.key);
      values[item.key] = {
        value: req?.valor ?? "",
        documentUrl: req?.documentoUrl ?? "",
      };
    }
    return values;
  }, [sortedCatalog, requisitoByKey]);

  const form = useForm<RequisitosFormData>({
    resolver: schema ? (zodResolver(schema) as Resolver<RequisitosFormData>) : undefined,
    defaultValues,
  });

  const catalogItemsWithoutRequisito = useMemo(
    () => sortedCatalog.filter((item) => !requisitoByKey.has(item.key)),
    [sortedCatalog, requisitoByKey]
  );

  const handleSubmitFromCatalog = form.handleSubmit(async (data) => {
    if (!sortedCatalog.length) return;
    try {
      for (const item of sortedCatalog) {
        const row = data[item.key];
        if (!row?.value?.trim()) continue;
        const value =
          item.tipoDato === "date"
            ? new Date(row.value.trim()).toISOString().slice(0, 10)
            : row.value.trim();
        const existing = requisitoByKey.get(item.key);
        if (existing) {
          await updateMutation.mutateAsync({
            requisitoId: existing.id,
            payload: {
              value,
              documentUrl: row.documentUrl?.trim() || null,
            },
          });
        } else {
          await createMutation.mutateAsync({
            key: item.key,
            value,
            documentUrl: row.documentUrl?.trim() || null,
          });
        }
      }
      setShowForm(false);
      form.reset(defaultValues);
      void refetch();
    } catch {
      // Error manejado por createMutation.isError
    }
  });

  const handleDelete = async (r: ActivoRequisito) => {
    if (!confirm("¿Eliminar este requisito?")) return;
    try {
      await deleteMutation.mutateAsync(r.id);
      void refetch();
    } catch {
      // Error manejado
    }
  };

  const handleAprobar = async (r: ActivoRequisito) => {
    try {
      await aprobarMutation.mutateAsync(r.id);
      void refetch();
    } catch {
      // Error manejado
    }
  };

  const handleRechazar = async (r: ActivoRequisito) => {
    if (!rechazarMotivo.trim()) return;
    try {
      await rechazarMutation.mutateAsync({
        requisitoId: r.id,
        motivo: rechazarMotivo.trim(),
      });
      setRechazandoId(null);
      setRechazarMotivo("");
      void refetch();
    } catch {
      // Error manejado
    }
  };

  const handleSuspender = async (r: ActivoRequisito) => {
    try {
      await suspenderMutation.mutateAsync(r.id);
      void refetch();
    } catch {
      // Error manejado
    }
  };

  if (catalogLoading || reqLoading) {
    return <p className="text-sm text-slate-500">Cargando requisitos…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  const hasCatalogForOtherTypes = Boolean(
    catalog?.some((c) => c.activo && c.tipoActivo !== tipoActivo)
  );
  const tipoActivoLabel =
    tipoActivo === "vehiculo"
      ? "Vehículo"
      : tipoActivo === "equipo"
        ? "Equipo"
        : tipoActivo === "embarcacion"
          ? "Embarcación"
          : tipoActivo === "guia"
            ? "Guía"
            : tipoActivo;

  if (!sortedCatalog.length) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Requisitos
        </h3>
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          {hasCatalogForOtherTypes
            ? `No hay requisitos definidos para el tipo «${tipoActivoLabel}». Un administrador puede añadirlos en Configuración → Catálogo de requisitos.`
            : "No hay catálogo de requisitos para este tipo de activo. Un administrador puede configurarlo en Configuración → Catálogo de requisitos."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Requisitos
        </h3>
        {catalogItemsWithoutRequisito.length > 0 && (
          <button
            type="button"
            onClick={() => {
              form.reset(defaultValues);
              setShowForm(true);
            }}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
          >
            Añadir requisito
          </button>
        )}
      </div>

      {showForm && schema && (
        <form
          onSubmit={handleSubmitFromCatalog}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30"
        >
          <h4 className="mb-3 text-sm font-medium">Completar requisitos</h4>
          {createMutation.isError && createMutation.error && (
            <p
              className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
              role="alert"
            >
              {getApiErrorMessage(createMutation.error)}
            </p>
          )}
          <div className="space-y-4">
            {sortedCatalog.map((item) => (
              <div key={item.id} className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`req-${item.key}`}
                    className={labelClass}
                  >
                    {item.label ?? item.key}
                    {item.requerido && (
                      <span className="ml-1 text-red-600">*</span>
                    )}
                  </label>
                  {item.tipoDato === "date" ? (
                    <input
                      id={`req-${item.key}`}
                      type="date"
                      {...form.register(`${item.key}.value`)}
                      className={inputClass}
                    />
                  ) : item.tipoDato === "number" ? (
                    <input
                      id={`req-${item.key}`}
                      type="number"
                      {...form.register(`${item.key}.value`)}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      id={`req-${item.key}`}
                      type="text"
                      {...form.register(`${item.key}.value`)}
                      className={inputClass}
                    />
                  )}
                  {form.formState.errors[item.key]?.value && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors[item.key]?.value?.message}
                    </p>
                  )}
                </div>
                {item.requiereDocumento && (
                  <div>
                    <label
                      htmlFor={`req-doc-${item.key}`}
                      className={labelClass}
                    >
                      URL documento
                    </label>
                    <input
                      id={`req-doc-${item.key}`}
                      type="url"
                      {...form.register(`${item.key}.documentUrl`)}
                      className={inputClass}
                      placeholder="https://…"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                form.reset(defaultValues);
              }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Requisito
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Valor
              </th>
              {isAdmin && (
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Acciones admin
                </th>
              )}
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
            {sortedCatalog.map((item) => {
              const req = requisitoByKey.get(item.key);
              return (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm font-medium">
                    {item.label ?? item.key}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                    {req ? req.valor : "—"}
                  </td>
                  {isAdmin && req && (
                    <td className="px-4 py-2">
                      {rechazandoId === req.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            aria-label="Motivo del rechazo"
                            placeholder="Motivo del rechazo"
                            value={rechazarMotivo}
                            onChange={(e) =>
                              setRechazarMotivo(e.target.value)
                            }
                            className="rounded border px-2 py-1 text-sm"
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleRechazar(req)}
                              disabled={
                                !rechazarMotivo.trim() ||
                                rechazarMutation.isPending
                              }
                              className="text-xs text-red-600 hover:underline disabled:opacity-50"
                            >
                              Confirmar rechazo
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRechazandoId(null);
                                setRechazarMotivo("");
                              }}
                              className="text-xs text-slate-600 hover:underline"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {req.status === "pendiente" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAprobar(req)}
                                disabled={aprobarMutation.isPending}
                                className="text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50"
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={() => setRechazandoId(req.id)}
                                className="text-xs font-medium text-rose-600 hover:underline"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {(req.status === "aprobado" ||
                            req.status === "pendiente") && (
                            <button
                              type="button"
                              onClick={() => handleSuspender(req)}
                              disabled={suspenderMutation.isPending}
                              className="text-xs font-medium text-amber-600 hover:underline disabled:opacity-50"
                            >
                              Suspender
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-2">
                    {req ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(req)}
                        disabled={deleteMutation.isPending}
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          form.reset(defaultValues);
                          setShowForm(true);
                        }}
                        className="text-sm font-medium text-(--cyan-accent) hover:underline"
                      >
                        Completar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
