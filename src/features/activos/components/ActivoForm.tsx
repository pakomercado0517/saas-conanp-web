"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { useCreateActivo } from "../hooks/useCreateActivo";
import { useUpdateActivo } from "../hooks/useUpdateActivo";
import { usePrestadores } from "@/features/prestadores/hooks/usePrestadores";
import {
  createActivoSchema,
  updateActivoSchema,
  type CreateActivoFormData,
  type UpdateActivoFormData,
} from "../schemas/activo.schema";
import type { Activo, ActivoTipo, UpdateActivoPayload } from "../types";

const TIPO_OPTIONS: { value: ActivoTipo; label: string }[] = [
  { value: "vehiculo", label: "Vehículo" },
  { value: "equipo", label: "Equipo" },
  { value: "infraestructura", label: "Infraestructura" },
  { value: "otro", label: "Otro" },
];

interface ActivoFormProps {
  areaId: string;
  activo?: Activo | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const inputClass =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

function CreateActivoFormInner({
  areaId,
  onSuccess,
  onCancel,
}: {
  areaId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const createMutation = useCreateActivo(areaId);
  const { data: prestadores } = usePrestadores(areaId);

  const form = useForm<CreateActivoFormData>({
    resolver: zodResolver(createActivoSchema),
    defaultValues: {
      tipo: "equipo",
      propietarioId: "",
      nombre: "",
      descripcion: "",
      status: "activo",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        tipo: data.tipo,
        propietarioId: data.propietarioId,
        nombre: data.nombre,
        descripcion: data.descripcion?.trim() || null,
        status: data.status ?? "activo",
      });
      onSuccess?.();
    } catch {
      // Error manejado
    }
  });

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

      <div>
        <label htmlFor="tipo" className={labelClass}>
          Tipo
        </label>
        <select id="tipo" {...form.register("tipo")} className={inputClass}>
          {TIPO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="propietarioId" className={labelClass}>
          Propietario
        </label>
        <select
          id="propietarioId"
          {...form.register("propietarioId")}
          className={inputClass}
        >
          <option value="">Selecciona un propietario</option>
          {prestadores?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name ?? p.User?.name ?? p.email ?? p.id}
            </option>
          ))}
        </select>
        {form.formState.errors.propietarioId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.propietarioId.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="nombre" className={labelClass}>
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          {...form.register("nombre")}
          className={inputClass}
        />
        {form.formState.errors.nombre && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.nombre.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="descripcion" className={labelClass}>
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          {...form.register("descripcion")}
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          Estado inicial
        </label>
        <select id="status" {...form.register("status")} className={inputClass}>
          <option value="activo">Activo</option>
          <option value="pendiente_validacion">Pendiente de validación</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
        >
          {createMutation.isPending ? "Creando…" : "Crear activo"}
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

function EditActivoFormInner({
  areaId,
  activo,
  onSuccess,
  onCancel,
}: {
  areaId: string;
  activo: Activo;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const updateMutation = useUpdateActivo(areaId);
  const { data: prestadores } = usePrestadores(areaId);

  const form = useForm<UpdateActivoFormData>({
    resolver: zodResolver(updateActivoSchema),
    defaultValues: {
      tipo: activo.tipo,
      propietarioId: activo.propietarioId,
      nombre: activo.nombre,
      descripcion: activo.descripcion ?? "",
      status: activo.status,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const payload: UpdateActivoPayload = {
        tipo: data.tipo,
        propietarioId: data.propietarioId,
        nombre: data.nombre,
        descripcion: data.descripcion && data.descripcion.trim() ? data.descripcion : null,
        status: data.status,
      };
      await updateMutation.mutateAsync({ activoId: activo.id, payload });
      onSuccess?.();
    } catch {
      // Error manejado
    }
  });

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {updateMutation.isError && updateMutation.error && (
        <p
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
          role="alert"
        >
          {getApiErrorMessage(updateMutation.error)}
        </p>
      )}

      <div>
        <label htmlFor="tipo" className={labelClass}>
          Tipo
        </label>
        <select id="tipo" {...form.register("tipo")} className={inputClass}>
          {TIPO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="propietarioId" className={labelClass}>
          Propietario
        </label>
        <select
          id="propietarioId"
          {...form.register("propietarioId")}
          className={inputClass}
        >
          <option value="">Selecciona un propietario</option>
          {prestadores?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name ?? p.User?.name ?? p.email ?? p.id}
            </option>
          ))}
        </select>
        {form.formState.errors.propietarioId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.propietarioId.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="nombre" className={labelClass}>
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          {...form.register("nombre")}
          className={inputClass}
        />
        {form.formState.errors.nombre && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.nombre.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="descripcion" className={labelClass}>
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          {...form.register("descripcion")}
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          Estado
        </label>
        <select id="status" {...form.register("status")} className={inputClass}>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="suspendido">Suspendido</option>
          <option value="pendiente_validacion">Pendiente de validación</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
        >
          {updateMutation.isPending ? "Guardando…" : "Guardar cambios"}
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

export function ActivoForm({
  areaId,
  activo,
  onSuccess,
  onCancel,
}: ActivoFormProps) {
  const isEdit = Boolean(activo?.id);

  if (isEdit && activo) {
    return (
      <EditActivoFormInner
        areaId={areaId}
        activo={activo}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );
  }

  return (
    <CreateActivoFormInner
      areaId={areaId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}
