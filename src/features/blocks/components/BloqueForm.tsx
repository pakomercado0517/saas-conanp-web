"use client";

import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { useCreateBloque } from "../hooks/useBloqueMutations";
import {
  createBloquePlantillaSchema,
  createBloquePorFechaSchema,
  type CreateBloquePlantillaFormData,
  type CreateBloquePorFechaFormData,
} from "../schemas/bloque.schema";

export type BloqueFormTipo = "plantilla" | "porFecha";

interface BloqueFormProps {
  areaId: string;
  actividadId: string;
  tipo: BloqueFormTipo;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const inputClass =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

export function BloqueForm({
  areaId,
  actividadId,
  tipo,
  onSuccess,
  onCancel,
}: BloqueFormProps) {
  const isPlantilla = tipo === "plantilla";
  const createMutation = useCreateBloque(areaId, actividadId);

  const formPlantilla = useForm<CreateBloquePlantillaFormData>({
    resolver: zodResolver(
      createBloquePlantillaSchema
    ) as Resolver<CreateBloquePlantillaFormData>,
    defaultValues: {
      startTime: "09:00",
      endTime: "12:00",
      capacidad: 10,
      plantilla: "",
    },
  });

  const formPorFecha = useForm<CreateBloquePorFechaFormData>({
    resolver: zodResolver(
      createBloquePorFechaSchema
    ) as Resolver<CreateBloquePorFechaFormData>,
    defaultValues: {
      date: "",
      startTime: "09:00",
      endTime: "12:00",
      capacidad: 10,
      plantilla: "",
    },
  });

  const onSubmitPlantilla = formPlantilla.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        startTime: data.startTime,
        endTime: data.endTime,
        capacidad: data.capacidad,
        plantilla: data.plantilla?.trim() || null,
      });
      formPlantilla.reset();
      onSuccess?.();
    } catch {
      // Error manejado por mutación
    }
  });

  const onSubmitPorFecha = formPorFecha.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        capacidad: data.capacidad,
        plantilla: data.plantilla?.trim() || null,
      });
      formPorFecha.reset();
      onSuccess?.();
    } catch {
      // Error manejado por mutación
    }
  });

  const onSubmit = isPlantilla ? onSubmitPlantilla : onSubmitPorFecha;

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {createMutation.isError && createMutation.error && (
        <p
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
          role="alert"
        >
          {getApiErrorMessage(createMutation.error)}
        </p>
      )}

      {!isPlantilla && (
        <div>
          <label htmlFor="bloque-date" className={labelClass}>
            Fecha
          </label>
          <input
            id="bloque-date"
            type="date"
            {...formPorFecha.register("date")}
            className={inputClass}
          />
          {formPorFecha.formState.errors.date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {formPorFecha.formState.errors.date.message}
            </p>
          )}
        </div>
      )}

      {isPlantilla ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className={labelClass}>
                Hora inicio
              </label>
              <input
                id="startTime"
                type="time"
                step="1"
                {...formPlantilla.register("startTime")}
                className={inputClass}
              />
              {formPlantilla.formState.errors.startTime && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formPlantilla.formState.errors.startTime.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="endTime" className={labelClass}>
                Hora fin
              </label>
              <input
                id="endTime"
                type="time"
                step="1"
                {...formPlantilla.register("endTime")}
                className={inputClass}
              />
              {formPlantilla.formState.errors.endTime && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formPlantilla.formState.errors.endTime.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="capacidad" className={labelClass}>
              Capacidad
            </label>
            <input
              id="capacidad"
              type="number"
              min={1}
              {...formPlantilla.register("capacidad", { valueAsNumber: true })}
              className={inputClass}
            />
            {formPlantilla.formState.errors.capacidad && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {formPlantilla.formState.errors.capacidad.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="plantilla" className={labelClass}>
              Plantilla (opcional)
            </label>
            <input
              id="plantilla"
              type="text"
              {...formPlantilla.register("plantilla")}
              className={inputClass}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className={labelClass}>
                Hora inicio
              </label>
              <input
                id="startTime"
                type="time"
                step="1"
                {...formPorFecha.register("startTime")}
                className={inputClass}
              />
              {formPorFecha.formState.errors.startTime && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formPorFecha.formState.errors.startTime.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="endTime" className={labelClass}>
                Hora fin
              </label>
              <input
                id="endTime"
                type="time"
                step="1"
                {...formPorFecha.register("endTime")}
                className={inputClass}
              />
              {formPorFecha.formState.errors.endTime && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formPorFecha.formState.errors.endTime.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="capacidad" className={labelClass}>
              Capacidad
            </label>
            <input
              id="capacidad"
              type="number"
              min={1}
              {...formPorFecha.register("capacidad", { valueAsNumber: true })}
              className={inputClass}
            />
            {formPorFecha.formState.errors.capacidad && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {formPorFecha.formState.errors.capacidad.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="plantilla" className={labelClass}>
              Plantilla (opcional)
            </label>
            <input
              id="plantilla"
              type="text"
              {...formPorFecha.register("plantilla")}
              className={inputClass}
            />
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
        >
          {createMutation.isPending
            ? "Creando…"
            : isPlantilla
              ? "Crear bloque plantilla"
              : "Crear bloque por fecha"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
