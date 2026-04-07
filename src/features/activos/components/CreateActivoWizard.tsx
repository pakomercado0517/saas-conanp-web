"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2, ArrowLeft } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { usePrestadores } from "@/features/prestadores/hooks/usePrestadores";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useActivoRequisitoCatalogo } from "../hooks/useActivoRequisitoCatalogo";
import { getActivoNombreQueryKey } from "../hooks/useActivoNombre";
import { createActivo } from "../services/activos.api";
import { createRequisito } from "../services/requisitos.api";
import { prestadorActivosOwnedQueryKey } from "../constants/prestadorActivosQueryKeys";
import type {
  Activo,
  ActivoRequisitoCatalogoItem,
  ActivoStatus,
  ActivoTipo,
} from "../types";

const step1Schema = z.object({
  type: z.enum(["embarcacion", "vehiculo", "guia", "equipo"], {
    message: "Selecciona un tipo de activo",
  }),
  ownerId: z.string().min(1, "Selecciona un propietario"),
  status: z
    .enum(["pendiente", "aprobado", "rechazado", "suspendido"])
    .optional(),
});

type Step1FormData = z.infer<typeof step1Schema>;

type WizardStep = "basic" | "requirements";

type RequisitosFormData = Record<
  string,
  { value: string; documentUrl?: string }
>;

const inputClass =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:ring-slate-400";
const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

const TYPE_OPTIONS: { value: ActivoTipo; label: string }[] = [
  { value: "embarcacion", label: "Embarcación" },
  { value: "vehiculo", label: "Vehículo" },
  { value: "guia", label: "Guía" },
  { value: "equipo", label: "Equipo" },
];

const STATUS_OPTIONS: { value: ActivoStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "suspendido", label: "Suspendido" },
];

const ACTIVOS_LIST_QUERY_PREFIX = ["activos"] as const;

export interface CreateActivoWizardProps {
  open: boolean;
  /**
   * Identificador de organización (ANP) de la ruta: contexto de permisos y resolución en servidor.
   * El activo se persiste por dependencia; no implica que el registro quede exclusivo de esta ANP.
   */
  areaId: string;
  onClose: () => void;
  /** Se llama cuando el wizard termina exitosamente (activo creado y requisitos guardados si aplica). */
  onCompleted?: (activo: Activo) => void;
  /** Si se indica, el propietario queda fijo y no se muestra el selector. */
  fixedOwnerPrestadorId?: string;
  /** Etiqueta para mostrar cuando el propietario está fijado (p. ej. nombre del prestador). */
  fixedOwnerDisplayName?: string;
  /**
   * URL del catálogo de requisitos (p. ej. `/dependencias/.../requisitos-catalogo` en flujo dependencia).
   * Por defecto: dashboard del área `/areas/:areaId/configuracion/requisitos-catalogo`.
   */
  requisitosCatalogoHref?: string;
}

export function CreateActivoWizard(props: CreateActivoWizardProps) {
  const {
    open,
    areaId,
    onClose,
    fixedOwnerPrestadorId,
    fixedOwnerDisplayName,
    requisitosCatalogoHref,
  } = props;
  const queryClient = useQueryClient();
  const configurarCatalogoHref =
    requisitosCatalogoHref ??
    getDashboardHref(areaId, "/configuracion/requisitos-catalogo");
  const { data: prestadores, isLoading: prestadoresLoading } = usePrestadores(
    areaId,
    {},
    { enabled: !fixedOwnerPrestadorId }
  );
  const { role, dependenciaId } = useAreaContext();
  const isAdmin = role === "admin";

  const [step, setStep] = useState<WizardStep>("basic");
  const [createdActivo, setCreatedActivo] = useState<Activo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSavingRequisitos, setIsSavingRequisitos] = useState(false);
  const [isCreatingActivos, setIsCreatingActivos] = useState(false);

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      type: "equipo",
      ownerId: "",
      status: "pendiente",
    },
    mode: "onSubmit",
  });

  const stepIndex = step === "basic" ? 0 : 1;
  const steps = useMemo(
    () =>
      [
        { id: "basic", label: "Datos básicos" },
        { id: "requirements", label: "Requisitos" },
      ] as const,
    []
  );

  const tipoActivo = createdActivo?.type ?? form.getValues("type");
  const catalogOptions = { dependenciaId: dependenciaId ?? undefined };
  const { data: catalogRaw, isLoading: catalogLoading } =
    useActivoRequisitoCatalogo(areaId, catalogOptions);

  const sortedCatalog = useMemo(() => {
    const catalog = (catalogRaw ?? []).filter(
      (c) => c.activo && c.tipoActivo === tipoActivo
    );
    return [...catalog].sort(
      (a, b) => a.orden - b.orden || a.key.localeCompare(b.key)
    );
  }, [catalogRaw, tipoActivo]);

  const requisitosSchema = useMemo(() => {
    if (!sortedCatalog.length) return null;
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const item of sortedCatalog) {
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
  }, [sortedCatalog]);

  const requisitosDefaultValues = useMemo(() => {
    const values: RequisitosFormData = {};
    for (const item of sortedCatalog) {
      values[item.key] = { value: "", documentUrl: "" };
    }
    return values;
  }, [sortedCatalog]);

  const requisitosForm = useForm<RequisitosFormData>({
    resolver: requisitosSchema
      ? (zodResolver(requisitosSchema) as Resolver<RequisitosFormData>)
      : undefined,
    defaultValues: requisitosDefaultValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!open) return;
    if (fixedOwnerPrestadorId) {
      form.reset({
        type: "equipo",
        ownerId: fixedOwnerPrestadorId,
        status: "pendiente",
      });
    } else {
      form.reset({
        type: "equipo",
        ownerId: "",
        status: "pendiente",
      });
    }
    setStep("basic");
    setCreatedActivo(null);
    setError(null);
    setIsSavingRequisitos(false);
    setIsCreatingActivos(false);
    requisitosForm.reset();
  }, [open, fixedOwnerPrestadorId, form, requisitosForm, areaId]);

  if (!open) return null;

  const handleClose = () => {
    setError(null);
    setStep("basic");
    setCreatedActivo(null);
    setIsSavingRequisitos(false);
    setIsCreatingActivos(false);
    form.reset();
    requisitosForm.reset();
    onClose();
  };

  async function invalidateAfterCreate(orgId: string, prestadorId: string) {
    void queryClient.invalidateQueries({
      queryKey: [...ACTIVOS_LIST_QUERY_PREFIX, orgId],
    });
    void queryClient.invalidateQueries({
      queryKey: prestadorActivosOwnedQueryKey(orgId, prestadorId),
    });
  }

  const handleFinalizarSinRequisitos = async () => {
    if (!createdActivo) return;
    await invalidateAfterCreate(areaId, createdActivo.ownerId);
    props.onCompleted?.(createdActivo);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      <div className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Crear activo
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          El activo queda asociado a la dependencia y comparte ese ámbito con
          todas las ANP de la misma. El identificador de organización en la ruta
          solo define el contexto de permisos y resolución en el servidor.
        </p>

        <div className="mt-5">
          <div className="flex items-center gap-3">
            {steps.map((s, idx) => {
              const isActive = idx === stepIndex;
              const isDone = idx < stepIndex;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-(--cyan-accent) text-(--navy-deep)"
                          : isDone
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="h-px w-12 bg-slate-200 dark:bg-slate-700" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        {step === "basic" ? (
          <form
            onSubmit={form.handleSubmit(async () => {
              try {
                setError(null);
                const values = step1Schema.parse(form.getValues());
                const ownerId = values.ownerId.trim();
                const status = values.status ?? "pendiente";

                setIsCreatingActivos(true);
                const activo = await createActivo(areaId, {
                  ownerId,
                  type: values.type,
                  status,
                });
                await invalidateAfterCreate(areaId, ownerId);
                setCreatedActivo(activo);
                setStep("requirements");
              } catch (err) {
                setError(getApiErrorMessage(err));
              } finally {
                setIsCreatingActivos(false);
              }
            })}
            className="mt-5 space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="wizard-type" className={labelClass}>
                  Tipo de activo
                </label>
                <select
                  id="wizard-type"
                  className={inputClass}
                  {...form.register("type")}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.type && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="wizard-ownerId" className={labelClass}>
                  Propietario
                </label>
                {fixedOwnerPrestadorId ? (
                  <>
                    <input
                      type="hidden"
                      id="wizard-ownerId"
                      {...form.register("ownerId")}
                    />
                    <p
                      id="wizard-owner-fixed"
                      className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200"
                    >
                      {fixedOwnerDisplayName?.trim() ||
                        "Prestador de esta dependencia"}
                    </p>
                  </>
                ) : (
                  <>
                    <select
                      id="wizard-ownerId"
                      className={inputClass}
                      disabled={prestadoresLoading}
                      {...form.register("ownerId")}
                    >
                      <option value="">
                        {prestadoresLoading
                          ? "Cargando prestadores…"
                          : "Selecciona un prestador"}
                      </option>
                      {prestadores?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name ?? p.User?.name ?? p.email ?? p.id}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.ownerId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {form.formState.errors.ownerId.message}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="wizard-status" className={labelClass}>
                  Estado inicial (opcional)
                </label>
                <select
                  id="wizard-status"
                  className={inputClass}
                  {...form.register("status")}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Si lo omites, se creará como pendiente.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreatingActivos}
                className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70"
              >
                {isCreatingActivos && (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                )}
                {isCreatingActivos ? "Creando…" : "Continuar"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Completa los requisitos según el tipo de activo.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
              {catalogLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    className="size-7 animate-spin text-(--cyan-accent)"
                    aria-hidden
                  />
                </div>
              ) : !sortedCatalog.length ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
                    No hay requisitos configurados para este tipo de activo en
                    el catálogo de la dependencia. Un administrador debe
                    definir el catálogo antes de agregar requisitos.
                  </div>
                  {isAdmin && (
                    <Link
                      href={configurarCatalogoHref}
                      className="inline-flex items-center gap-2 text-sm font-medium text-(--cyan-accent) hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Configurar catálogo
                    </Link>
                  )}
                  <div className="flex flex-wrap justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => void setStep("basic")}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <ArrowLeft className="size-4" aria-hidden />
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleFinalizarSinRequisitos()}
                      className="rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
                    >
                      Finalizar sin requisitos
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={requisitosForm.handleSubmit(async (data) => {
                    if (!createdActivo) return;
                    try {
                      setError(null);
                      setIsSavingRequisitos(true);
                      const itemsToSend: {
                        item: ActivoRequisitoCatalogoItem;
                        value: string;
                        documentUrl: string | null;
                      }[] = [];

                      for (const item of sortedCatalog) {
                        const row = data[item.key];
                        const rawValue = row?.value?.trim() ?? "";
                        if (!rawValue) continue;
                        const value =
                          item.tipoDato === "date"
                            ? new Date(rawValue).toISOString().slice(0, 10)
                            : rawValue;
                        itemsToSend.push({
                          item,
                          value,
                          documentUrl: row?.documentUrl?.trim()
                            ? row.documentUrl.trim()
                            : null,
                        });
                      }

                      await Promise.all(
                        itemsToSend.map(({ item, value, documentUrl }) =>
                          createRequisito(areaId, createdActivo.id, {
                            key: item.key,
                            value,
                            documentUrl,
                          })
                        )
                      );

                      await invalidateAfterCreate(
                        areaId,
                        createdActivo.ownerId
                      );
                      void queryClient.invalidateQueries({
                        queryKey: getActivoNombreQueryKey(
                          areaId,
                          createdActivo.id
                        ),
                      });

                      props.onCompleted?.(createdActivo);
                      handleClose();
                    } catch (err) {
                      setError(getApiErrorMessage(err));
                    } finally {
                      setIsSavingRequisitos(false);
                    }
                  })}
                  className="space-y-4"
                >
                  {sortedCatalog.map((item) => (
                    <div key={item.id} className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`wizard-req-${item.key}`}
                          className={labelClass}
                        >
                          {item.label ?? item.key}
                          {item.requerido && (
                            <span className="ml-1 text-red-600">*</span>
                          )}
                        </label>

                        {item.tipoDato === "date" ? (
                          <input
                            id={`wizard-req-${item.key}`}
                            type="date"
                            className={inputClass}
                            {...requisitosForm.register(`${item.key}.value`)}
                          />
                        ) : item.tipoDato === "number" ? (
                          <input
                            id={`wizard-req-${item.key}`}
                            type="number"
                            className={inputClass}
                            {...requisitosForm.register(`${item.key}.value`)}
                          />
                        ) : (
                          <input
                            id={`wizard-req-${item.key}`}
                            type="text"
                            className={inputClass}
                            {...requisitosForm.register(`${item.key}.value`)}
                          />
                        )}

                        {requisitosForm.formState.errors[item.key]?.value && (
                          <p className="mt-1 text-xs text-red-600">
                            {
                              requisitosForm.formState.errors[item.key]?.value
                                ?.message
                            }
                          </p>
                        )}
                      </div>

                      {item.requiereDocumento && (
                        <div>
                          <label
                            htmlFor={`wizard-req-doc-${item.key}`}
                            className={labelClass}
                          >
                            URL documento
                          </label>
                          <input
                            id={`wizard-req-doc-${item.key}`}
                            type="url"
                            className={inputClass}
                            placeholder="https://…"
                            {...requisitosForm.register(
                              `${item.key}.documentUrl`
                            )}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("basic")}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      disabled={isSavingRequisitos}
                    >
                      <ArrowLeft className="size-4" aria-hidden />
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingRequisitos}
                      className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70"
                    >
                      {isSavingRequisitos && (
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden
                        />
                      )}
                      {isSavingRequisitos ? "Guardando…" : "Guardar"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

