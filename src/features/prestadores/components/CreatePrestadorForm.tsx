"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import {
  createPrestadorCompletoSchema,
  type CreatePrestadorCompletoFormData,
  type CreatePrestadorCompletoFormInput,
} from "../schemas/prestador.schema";
import type { ActivoTipoCrear } from "../types";

const STATUS_OPTIONS: { value: CreatePrestadorCompletoFormData["status"]; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "suspendido", label: "Suspendido" },
];

const ACTIVO_TIPO_OPTIONS: { value: ActivoTipoCrear; label: string }[] = [
  { value: "embarcacion", label: "Embarcación" },
  { value: "vehiculo", label: "Vehículo" },
  { value: "guia", label: "Guía" },
  { value: "equipo", label: "Equipo" },
];

type EcosystemType = "terrestre" | "maritimo" | "mixto";

function getAllowedActivoTypes(ecosystemType: EcosystemType | undefined): ActivoTipoCrear[] {
  if (!ecosystemType) return ["embarcacion", "vehiculo", "guia", "equipo"];
  if (ecosystemType === "maritimo") return ["embarcacion", "guia", "equipo"];
  if (ecosystemType === "terrestre") return ["vehiculo", "guia", "equipo"];
  return ["embarcacion", "vehiculo", "guia", "equipo"];
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300";

export type CreatePrestadorSubmitPayload = {
  email: string;
  name: string;
  password: string;
  status: "activo" | "inactivo" | "suspendido";
  permitExpiresAt?: string | null;
  activos?: { type: ActivoTipoCrear }[];
};

interface CreatePrestadorFormProps {
  onSubmit: (payload: CreatePrestadorSubmitPayload) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  serverError: string | null;
}

export function CreatePrestadorForm({
  onSubmit,
  onCancel,
  isPending,
  serverError,
}: CreatePrestadorFormProps) {
  const { area } = useAreaContext();
  const ecosystemType = area?.ecosystem_type;
  const allowedActivoTypes = getAllowedActivoTypes(ecosystemType);

  const form = useForm<CreatePrestadorCompletoFormInput>({
    resolver: zodResolver(createPrestadorCompletoSchema) as never,
    defaultValues: {
      email: "",
      name: "",
      password: "",
      status: "activo",
      permitExpiresAt: "",
      activos: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "activos",
  });

  function handleSubmit(data: CreatePrestadorCompletoFormInput) {
    const parsed = createPrestadorCompletoSchema.safeParse(data);
    if (!parsed.success) return;
    const out = parsed.data;
    const permitExpiresAt = out.permitExpiresAt
      ? new Date(out.permitExpiresAt).toISOString()
      : undefined;
    const activos = (out.activos ?? []).filter((a) => a.type);
    void onSubmit({
      email: out.email,
      name: out.name,
      password: out.password,
      status: out.status,
      permitExpiresAt: permitExpiresAt ?? null,
      activos: activos.length > 0 ? activos : undefined,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {serverError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="create-prestador-email" className={labelClass}>
          Correo electrónico
        </label>
        <input
          id="create-prestador-email"
          type="email"
          placeholder="correo@ejemplo.com"
          className={inputClass}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="create-prestador-name" className={labelClass}>
          Nombre completo
        </label>
        <input
          id="create-prestador-name"
          type="text"
          placeholder="Nombre y apellidos del prestador"
          className={inputClass}
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="create-prestador-password" className={labelClass}>
          Contraseña inicial
        </label>
        <input
          id="create-prestador-password"
          type="password"
          placeholder="Contraseña temporal"
          className={inputClass}
          {...form.register("password")}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          El prestador podrá cambiarla después.
        </p>
        {form.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="create-prestador-status" className={labelClass}>
          Estado
        </label>
        <select id="create-prestador-status" className={inputClass} {...form.register("status")}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="create-prestador-permitExpiresAt" className={labelClass}>
          Vigencia del permiso
        </label>
        <input
          id="create-prestador-permitExpiresAt"
          type="datetime-local"
          className={inputClass}
          {...form.register("permitExpiresAt")}
        />
        {form.formState.errors.permitExpiresAt && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.permitExpiresAt.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className={labelClass}>Activos del prestador (opcional)</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Agrega embarcaciones, vehículos u otros activos según el tipo de área.
        </p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <select
              className={inputClass + " flex-1"}
              {...form.register(`activos.${index}.type`)}
            >
              <option value="">Selecciona tipo</option>
              {ACTIVO_TIPO_OPTIONS.filter((opt) => allowedActivoTypes.includes(opt.value)).map(
                (opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                )
              )}
            </select>
            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
              aria-label="Quitar activo"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ type: allowedActivoTypes[0] ?? "equipo" })}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Plus className="size-4" />
          Agregar activo
        </button>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
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
            <span className="size-4 animate-spin rounded-full border-2 border-(--navy-deep) border-t-transparent" aria-hidden />
          )}
          Crear prestador
        </button>
      </div>
    </form>
  );
}
