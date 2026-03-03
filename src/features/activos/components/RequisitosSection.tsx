"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { useRequisitos } from "../hooks/useRequisitos";
import {
  useCreateRequisito,
  useDeleteRequisito,
  useAprobarRequisito,
  useRechazarRequisito,
  useSuspenderRequisito,
} from "../hooks/useRequisitoMutations";
import { createRequisitoSchema, type CreateRequisitoFormData } from "../schemas/activo.schema";
import type { ActivoRequisito, RequisitoStatus } from "../types";

const STATUS_LABELS: Record<RequisitoStatus, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  suspendido: "Suspendido",
};

interface RequisitosSectionProps {
  areaId: string;
  activoId: string;
}

const inputClass =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

export function RequisitosSection({ areaId, activoId }: RequisitosSectionProps) {
  const { role } = useAreaContext();
  const isAdmin = role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [rechazarMotivo, setRechazarMotivo] = useState("");
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);

  const { data: requisitos, isLoading, isError, error, refetch } =
    useRequisitos(areaId, activoId);
  const createMutation = useCreateRequisito(areaId, activoId);
  const deleteMutation = useDeleteRequisito(areaId, activoId);
  const aprobarMutation = useAprobarRequisito(areaId, activoId);
  const rechazarMutation = useRechazarRequisito(areaId, activoId);
  const suspenderMutation = useSuspenderRequisito(areaId, activoId);

  const form = useForm<CreateRequisitoFormData>({
    resolver: zodResolver(createRequisitoSchema),
    defaultValues: {
      clave: "",
      valor: "",
      documentoUrl: "",
    },
  });

  const handleCreateSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        clave: data.clave,
        valor: data.valor,
        documentoUrl: data.documentoUrl?.trim() || null,
      });
      setShowForm(false);
      form.reset();
      void refetch();
    } catch {
      // Error manejado
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

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando requisitos…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Requisitos
        </h3>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
          }}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
        >
          Añadir requisito
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30"
        >
          <h4 className="mb-3 text-sm font-medium">Nuevo requisito</h4>
          {createMutation.isError && createMutation.error && (
            <p
              className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
              role="alert"
            >
              {getApiErrorMessage(createMutation.error)}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="clave" className={labelClass}>
                Clave
              </label>
              <input
                id="clave"
                {...form.register("clave")}
                className={inputClass}
              />
              {form.formState.errors.clave && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.clave.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="valor" className={labelClass}>
                Valor
              </label>
              <input
                id="valor"
                {...form.register("valor")}
                className={inputClass}
              />
              {form.formState.errors.valor && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.valor.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="documentoUrl" className={labelClass}>
                URL documento (opcional)
              </label>
              <input
                id="documentoUrl"
                type="url"
                {...form.register("documentoUrl")}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creando…" : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                form.reset();
              }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!requisitos?.length ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          No hay requisitos para este activo.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Clave
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Valor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                  Estado
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
              {requisitos.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm font-medium">{r.clave}</td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                    {r.valor}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        r.status === "aprobado"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : r.status === "rechazado"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            : r.status === "suspendido"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-2">
                      {rechazandoId === r.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            aria-label="Motivo del rechazo"
                            placeholder="Motivo del rechazo"
                            value={rechazarMotivo}
                            onChange={(e) => setRechazarMotivo(e.target.value)}
                            className="rounded border px-2 py-1 text-sm"
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleRechazar(r)}
                              disabled={!rechazarMotivo.trim() || rechazarMutation.isPending}
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
                          {r.status === "pendiente" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAprobar(r)}
                                disabled={aprobarMutation.isPending}
                                className="text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50"
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={() => setRechazandoId(r.id)}
                                className="text-xs font-medium text-rose-600 hover:underline"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {(r.status === "aprobado" || r.status === "pendiente") && (
                            <button
                              type="button"
                              onClick={() => handleSuspender(r)}
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
                    <button
                      type="button"
                      onClick={() => handleDelete(r)}
                      disabled={deleteMutation.isPending}
                      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
