"use client";

import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { useCreateActividad } from "../hooks/useCreateActividad";
import { useUpdateActividad } from "../hooks/useUpdateActividad";
import {
  createActividadSchema,
  updateActividadSchema,
} from "../schemas/activity.schema";
import type { Actividad } from "../types";
import type { ActividadType, AgendaType, NivelImpacto } from "../types";

/** Valores del formulario (impactLevel puede ser null si no se selecciona). */
interface ActividadFormValues {
  name: string;
  type: ActividadType;
  agendaType: "BLOQUES" | "HORARIO_LIBRE";
  requiresGuide: boolean;
  impactLevel: NivelImpacto | null;
  active: boolean;
}

const inputClass =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

const AGENDA_OPTIONS: { value: AgendaType; label: string }[] = [
  { value: "BLOQUES", label: "Bloques" },
  { value: "HORARIO_LIBRE", label: "Horario libre" },
];

const TYPE_OPTIONS: { value: ActividadType; label: string }[] = [
  { value: "terrestre", label: "Terrestre" },
  { value: "maritima", label: "Marítima" },
  { value: "mixta", label: "Mixta" },
];

const NIVEL_OPTIONS: { value: NivelImpacto; label: string }[] = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
];

interface ActividadFormProps {
  areaId: string;
  actividad?: Actividad | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ActividadForm({
  areaId,
  actividad,
  onSuccess,
  onCancel,
}: ActividadFormProps) {
  const isEdit = Boolean(actividad?.id);

  const createMutation = useCreateActividad(areaId);
  const updateMutation = useUpdateActividad(areaId, actividad?.id ?? "");

  const form = useForm<ActividadFormValues>({
    resolver: zodResolver(
      isEdit ? updateActividadSchema : createActividadSchema
    ) as Resolver<ActividadFormValues>,
    defaultValues: {
      name: actividad?.name ?? "",
      type: actividad?.type ?? "terrestre",
      agendaType: actividad?.agendaType ?? "HORARIO_LIBRE",
      requiresGuide: actividad?.requiereGuia ?? false,
      impactLevel: actividad?.nivelImpacto ?? null,
      active: actividad?.active ?? true,
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  const onSubmit = form.handleSubmit(async (data) => {
    const impactLevel = data.impactLevel ?? "medio";
    const payload = {
      name: data.name,
      type: data.type,
      agendaType: data.agendaType,
      requiresGuide: data.requiresGuide,
      impactLevel,
      active: data.active,
    };

    if (isEdit) {
      await updateMutation.update(payload);
    } else {
      await createMutation.create(payload);
    }
    onSuccess?.();
  });

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {error && (
        <p
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
          role="alert"
        >
          {getApiErrorMessage(error)}
        </p>
      )}

      <div>
        <label htmlFor="actividad-name" className={labelClass}>
          Nombre
        </label>
        <input
          id="actividad-name"
          type="text"
          {...form.register("name")}
          className={inputClass}
          placeholder="Nombre de la actividad"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="actividad-type" className={labelClass}>
          Tipo de actividad
        </label>
        <select
          id="actividad-type"
          {...form.register("type")}
          className={inputClass}
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
        <label htmlFor="actividad-agendaType" className={labelClass}>
          Tipo de agenda
        </label>
        <select
          id="actividad-agendaType"
          {...form.register("agendaType")}
          className={inputClass}
        >
          {AGENDA_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {form.formState.errors.agendaType && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.agendaType.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="actividad-impactLevel" className={labelClass}>
          Nivel de impacto
        </label>
        <select
          id="actividad-impactLevel"
          {...form.register("impactLevel")}
          className={inputClass}
        >
          <option value="">Sin especificar</option>
          {NIVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {form.formState.errors.impactLevel && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.impactLevel.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="actividad-requiresGuide"
          type="checkbox"
          {...form.register("requiresGuide")}
          className="size-4 rounded border-slate-300 dark:border-slate-600"
        />
        <label htmlFor="actividad-requiresGuide" className="text-sm text-slate-700 dark:text-slate-300">
          Requiere guía
        </label>
      </div>
      {form.formState.errors.requiresGuide && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {form.formState.errors.requiresGuide.message}
        </p>
      )}

      <div className="flex items-center gap-2">
        <input
          id="actividad-active"
          type="checkbox"
          {...form.register("active")}
          className="size-4 rounded border-slate-300 dark:border-slate-600"
        />
        <label htmlFor="actividad-active" className="text-sm text-slate-700 dark:text-slate-300">
          Activa
        </label>
      </div>
      {form.formState.errors.active && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {form.formState.errors.active.message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
        >
          {isPending ? "Guardando…" : "Guardar"}
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
