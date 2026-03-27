"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import {
  formatIsoToDateInput,
  getDefaultTimeZone,
} from "@/shared/lib/date";
import { useCreatePermiso } from "../hooks/useCreatePermiso";
import { useUpdatePermiso } from "../hooks/useUpdatePermiso";
import { usePrestadores } from "@/features/prestadores/hooks/usePrestadores";
import { useActividades } from "../hooks/useActividades";
import {
  createPermisoSchema,
  updatePermisoSchema,
  type CreatePermisoFormData,
  type UpdatePermisoFormData,
} from "../schemas/permiso.schema";
import type { Permiso, UpdatePermisoPayload } from "../types";

const STATUS_OPTIONS: { value: "activo" | "inactivo"; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

const STATUS_EDIT_OPTIONS: { value: Permiso["status"]; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "vencido", label: "Vencido" },
  { value: "suspendido", label: "Suspendido" },
];

interface PermisoFormProps {
  areaId: string;
  permiso?: Permiso | null;
  /** Prestador preseleccionado al crear (p. ej. filtro del listado). */
  defaultPrestadorId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const inputClass =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

function CreatePermisoFormInner({
  areaId,
  defaultPrestadorId,
  onSuccess,
  onCancel,
}: {
  areaId: string;
  defaultPrestadorId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const createMutation = useCreatePermiso(areaId);
  const { data: prestadores } = usePrestadores(areaId);
  const { data: actividades } = useActividades(areaId);

  const form = useForm<CreatePermisoFormData>({
    resolver: zodResolver(createPermisoSchema),
    defaultValues: {
      prestadorId: defaultPrestadorId ?? "",
      actividadId: "",
      appliesToAllAreas: false,
      vigenciaDesde: "",
      vigenciaHasta: "",
      status: "activo",
      documentoUrl: "",
    },
  });

  useEffect(() => {
    if (defaultPrestadorId) {
      form.setValue("prestadorId", defaultPrestadorId);
    }
  }, [defaultPrestadorId, form]);

  const appliesToAllAreasCreate = useWatch({
    control: form.control,
    name: "appliesToAllAreas",
    defaultValue: false,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        prestadorId: data.prestadorId,
        actividadId: data.actividadId,
        appliesToAllAreas: data.appliesToAllAreas,
        vigenciaDesde: data.vigenciaDesde,
        vigenciaHasta: data.vigenciaHasta,
        status: data.status ?? "activo",
        documentoUrl: data.documentoUrl?.trim() || null,
      });
      onSuccess?.();
    } catch {
      // Error manejado por isError/error
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
        <label htmlFor="prestadorId" className={labelClass}>
          Prestador
        </label>
        <select
          id="prestadorId"
          {...form.register("prestadorId")}
          className={inputClass}
        >
          <option value="">Selecciona un prestador</option>
          {prestadores?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name ?? p.User?.name ?? p.email ?? p.id}
            </option>
          ))}
        </select>
        {form.formState.errors.prestadorId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.prestadorId.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="actividadId" className={labelClass}>
          Actividad
        </label>
        {actividades && actividades.length > 0 ? (
          <select
            id="actividadId"
            {...form.register("actividadId")}
            className={inputClass}
          >
            <option value="">Selecciona una actividad</option>
            {actividades.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="actividadId"
            type="text"
            {...form.register("actividadId")}
            placeholder="ID de actividad"
            className={inputClass}
          />
        )}
        {form.formState.errors.actividadId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.actividadId.message}
          </p>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/20">
        <input
          id="appliesToAllAreas-create"
          type="checkbox"
          className="mt-1 size-4 rounded border-slate-300 dark:border-slate-600"
          checked={Boolean(appliesToAllAreasCreate)}
          onChange={(e) => {
            form.setValue("appliesToAllAreas", e.target.checked, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />
        <div>
          <label
            htmlFor="appliesToAllAreas-create"
            className="text-sm font-medium text-slate-800 dark:text-slate-100"
          >
            Aplica a todas las áreas
          </label>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Si lo marcas, el permiso queda registrado para todas las áreas naturales protegidas y no
            tendrás que repetir la misma información en cada área.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="vigenciaDesde" className={labelClass}>
          Vigencia desde
        </label>
        <input
          id="vigenciaDesde"
          type="date"
          {...form.register("vigenciaDesde")}
          className={inputClass}
        />
        {form.formState.errors.vigenciaDesde && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.vigenciaDesde.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="vigenciaHasta" className={labelClass}>
          Vigencia hasta
        </label>
        <input
          id="vigenciaHasta"
          type="date"
          {...form.register("vigenciaHasta")}
          className={inputClass}
        />
        {form.formState.errors.vigenciaHasta && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.vigenciaHasta.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          Estado
        </label>
        <select id="status" {...form.register("status")} className={inputClass}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="documentoUrl" className={labelClass}>
          URL del documento (opcional)
        </label>
        <input
          id="documentoUrl"
          type="url"
          {...form.register("documentoUrl")}
          placeholder="https://..."
          className={inputClass}
        />
        {form.formState.errors.documentoUrl && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.documentoUrl.message}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
        >
          {createMutation.isPending ? "Creando…" : "Crear permiso"}
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

function EditPermisoFormInner({
  areaId,
  permiso,
  onSuccess,
  onCancel,
}: {
  areaId: string;
  permiso: Permiso;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const updateMutation = useUpdatePermiso(areaId);
  const tz = getDefaultTimeZone();

  const form = useForm<UpdatePermisoFormData>({
    resolver: zodResolver(updatePermisoSchema),
    defaultValues: {
      appliesToAllAreas: permiso.appliesToAllAreas,
      vigenciaDesde: formatIsoToDateInput(permiso.vigenciaDesde, tz),
      vigenciaHasta: formatIsoToDateInput(permiso.vigenciaHasta, tz),
      status: permiso.status,
      documentoUrl: permiso.documentoUrl ?? "",
    },
  });

  const appliesToAllAreasEdit = useWatch({
    control: form.control,
    name: "appliesToAllAreas",
    defaultValue: permiso.appliesToAllAreas,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const payload: UpdatePermisoPayload = {
        appliesToAllAreas: data.appliesToAllAreas,
        vigenciaDesde: data.vigenciaDesde,
        vigenciaHasta: data.vigenciaHasta,
        status: data.status,
        documentoUrl:
          data.documentoUrl && data.documentoUrl.trim()
            ? data.documentoUrl
            : null,
      };
      await updateMutation.mutateAsync({ permisoId: permiso.id, payload });
      onSuccess?.();
    } catch {
      // Error manejado por isError/error
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

      <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/20">
        <input
          id="appliesToAllAreas-edit"
          type="checkbox"
          className="mt-1 size-4 rounded border-slate-300 dark:border-slate-600"
          checked={Boolean(appliesToAllAreasEdit)}
          onChange={(e) => {
            form.setValue("appliesToAllAreas", e.target.checked, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />
        <div>
          <label
            htmlFor="appliesToAllAreas-edit"
            className="text-sm font-medium text-slate-800 dark:text-slate-100"
          >
            Aplica a todas las áreas
          </label>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Si lo marcas, el permiso queda registrado para todas las áreas naturales protegidas y no
            tendrás que repetir la misma información en cada área.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="vigenciaDesde" className={labelClass}>
          Vigencia desde
        </label>
        <input
          id="vigenciaDesde"
          type="date"
          {...form.register("vigenciaDesde")}
          className={inputClass}
        />
        {form.formState.errors.vigenciaDesde && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.vigenciaDesde.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="vigenciaHasta" className={labelClass}>
          Vigencia hasta
        </label>
        <input
          id="vigenciaHasta"
          type="date"
          {...form.register("vigenciaHasta")}
          className={inputClass}
        />
        {form.formState.errors.vigenciaHasta && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.vigenciaHasta.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          Estado
        </label>
        <select id="status" {...form.register("status")} className={inputClass}>
          {STATUS_EDIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="documentoUrl" className={labelClass}>
          URL del documento (opcional)
        </label>
        <input
          id="documentoUrl"
          type="url"
          {...form.register("documentoUrl")}
          placeholder="https://..."
          className={inputClass}
        />
        {form.formState.errors.documentoUrl && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.documentoUrl.message}
          </p>
        )}
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

export function PermisoForm({
  areaId,
  permiso,
  defaultPrestadorId,
  onSuccess,
  onCancel,
}: PermisoFormProps) {
  const isEdit = Boolean(permiso?.id);

  if (isEdit && permiso) {
    return (
      <EditPermisoFormInner
        areaId={areaId}
        permiso={permiso}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );
  }

  return (
    <CreatePermisoFormInner
      areaId={areaId}
      defaultPrestadorId={defaultPrestadorId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}
