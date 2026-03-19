"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, MapPin, Loader2, Plus, Trash2 } from "lucide-react";
import { ApiError, getApiErrorMessage } from "@/shared/types/api";
import { useCreateDependenciaArea } from "../hooks/useCreateDependenciaArea";
import {
  createAreaSchema,
  type CreateAreaFormData,
  type RequisitoCatalogoItemFormData,
} from "../schemas/dependencia.schema";

const ECOSYSTEM_OPTIONS = [
  { value: "terrestre" as const, label: "Terrestre" },
  { value: "maritimo" as const, label: "Marítimo" },
  { value: "mixto" as const, label: "Mixto" },
];

const TIPO_ACTIVO_OPTIONS: { value: RequisitoCatalogoItemFormData["tipoActivo"]; label: string }[] = [
  { value: "embarcacion", label: "Embarcación" },
  { value: "vehiculo", label: "Vehículo" },
  { value: "guia", label: "Guía" },
  { value: "equipo", label: "Equipo" },
];

const TIPO_DATO_OPTIONS: { value: RequisitoCatalogoItemFormData["tipoDato"]; label: string }[] = [
  { value: "string", label: "Texto" },
  { value: "date", label: "Fecha" },
  { value: "number", label: "Número" },
];

interface CreateAreaDialogProps {
  dependenciaId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAreaDialog({
  dependenciaId,
  open,
  onClose,
  onSuccess,
}: CreateAreaDialogProps) {
  const { create, isPending } = useCreateDependenciaArea(dependenciaId);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateAreaFormData>({
    resolver: zodResolver(createAreaSchema),
    defaultValues: {
      name: "",
      ecosystem_type: undefined,
      requisitoCatalogo: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requisitoCatalogo",
  });

  const defaultCatalogoItem: RequisitoCatalogoItemFormData = {
    tipoActivo: "equipo",
    key: "",
    tipoDato: "string",
    requerido: false,
    requiereDocumento: false,
    orden: 0,
  };

  async function onSubmit(data: CreateAreaFormData) {
    setServerError(null);
    const payload = {
      name: data.name,
      ecosystem_type: data.ecosystem_type,
      ...(data.requisitoCatalogo?.length
        ? {
            requisitoCatalogo: data.requisitoCatalogo.map((item) => ({
              tipoActivo: item.tipoActivo,
              key: item.key,
              label: item.label || undefined,
              tipoDato: item.tipoDato,
              requerido: item.requerido ?? false,
              requiereDocumento: item.requiereDocumento ?? false,
              orden: item.orden,
              activo: item.activo ?? true,
            })),
          }
        : {}),
    };
    try {
      await create(payload);
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (err instanceof ApiError && err.details.length > 0) {
        err.details.forEach(({ campo, mensaje }) => {
          if (campo === "name" || campo === "ecosystem_type") {
            setError(campo, { type: "server", message: mensaje });
          } else if (campo?.startsWith("requisitoCatalogo.")) {
            setError("requisitoCatalogo", { type: "server", message: mensaje });
          }
        });
      } else {
        setServerError(message);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
            <MapPin className="size-5 text-(--cyan-accent)" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-(--navy-deep) dark:text-white">
            Crear área
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <div>
            <label
              htmlFor="area-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300"
            >
              Nombre del área
            </label>
            <input
              id="area-name"
              type="text"
              placeholder="Ej. Parque Nacional Isla Contoy"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Tipo de ecosistema
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ECOSYSTEM_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-(--slate-text) transition-colors has-checked:border-(--cyan-accent) has-checked:bg-(--cyan-accent) has-checked:text-(--navy-deep) hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    className="sr-only"
                    {...register("ecosystem_type")}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.ecosystem_type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.ecosystem_type.message}
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-(--navy-deep) dark:text-slate-200">
                Requisitos de activos para esta área
              </span>
              <button
                type="button"
                onClick={() => append(defaultCatalogoItem)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-(--slate-text) hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Plus className="size-3.5" aria-hidden />
                Añadir ítem
              </button>
            </div>
            {errors.requisitoCatalogo?.message && (
              <p className="text-sm text-red-600">{errors.requisitoCatalogo.message}</p>
            )}
            <ul className="space-y-3">
              {fields.map((field, index) => (
                <li
                  key={field.id}
                  className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div>
                      <label className="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Tipo activo
                      </label>
                      <select
                        className="w-full rounded border border-slate-200 bg-white py-1.5 px-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        {...register(`requisitoCatalogo.${index}.tipoActivo`)}
                      >
                        {TIPO_ACTIVO_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Clave
                      </label>
                      <input
                        type="text"
                        placeholder="ej. permiso_operacion"
                        className="w-full rounded border border-slate-200 py-1.5 px-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        {...register(`requisitoCatalogo.${index}.key`)}
                      />
                      {errors.requisitoCatalogo?.[index]?.key && (
                        <p className="mt-0.5 text-xs text-red-600">
                          {errors.requisitoCatalogo[index]?.key?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Etiqueta (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Permiso de operación"
                        className="w-full rounded border border-slate-200 py-1.5 px-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        {...register(`requisitoCatalogo.${index}.label`)}
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Tipo dato
                      </label>
                      <select
                        className="w-full rounded border border-slate-200 bg-white py-1.5 px-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        {...register(`requisitoCatalogo.${index}.tipoDato`)}
                      >
                        {TIPO_DATO_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        {...register(`requisitoCatalogo.${index}.requerido`)}
                      />
                      Requerido
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        {...register(`requisitoCatalogo.${index}.requiereDocumento`)}
                      />
                      Requiere documento
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Orden
                      </label>
                      <input
                        type="number"
                        min={0}
                        className="w-16 rounded border border-slate-200 py-1 px-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        {...register(`requisitoCatalogo.${index}.orden`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="ml-auto rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400"
                      aria-label="Eliminar ítem"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {fields.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Opcional. Añade ítems para definir el catálogo de requisitos por tipo de activo.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70"
            >
              {isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              Crear área
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
