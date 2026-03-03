"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
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

const STATUS_OPTIONS: { value: "vigente" | "pendiente"; label: string }[] = [
  { value: "vigente", label: "Vigente" },
  { value: "pendiente", label: "Pendiente" },
];

const STATUS_EDIT_OPTIONS: { value: Permiso["status"]; label: string }[] = [
  { value: "vigente", label: "Vigente" },
  { value: "vencido", label: "Vencido" },
  { value: "revocado", label: "Revocado" },
  { value: "pendiente", label: "Pendiente" },
];

interface PermisoFormProps {
  areaId: string;
  permiso?: Permiso | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function formatDateForInput(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

const inputClass =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

function CreatePermisoFormInner({
  areaId,
  onSuccess,
  onCancel,
}: {
  areaId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const createMutation = useCreatePermiso(areaId);
  const { data: prestadores } = usePrestadores(areaId);
  const { data: actividades } = useActividades(areaId);

  const form = useForm<CreatePermisoFormData>({
    resolver: zodResolver(createPermisoSchema),
    defaultValues: {
      prestadorId: "",
      actividadId: "",
      vigenciaDesde: "",
      vigenciaHasta: "",
      status: "vigente",
      documentoUrl: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        prestadorId: data.prestadorId,
        actividadId: data.actividadId,
        vigenciaDesde: data.vigenciaDesde,
        vigenciaHasta: data.vigenciaHasta,
        status: data.status ?? "vigente",
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

  const form = useForm<UpdatePermisoFormData>({
    resolver: zodResolver(updatePermisoSchema),
    defaultValues: {
      vigenciaDesde: formatDateForInput(permiso.vigenciaDesde),
      vigenciaHasta: formatDateForInput(permiso.vigenciaHasta),
      status: permiso.status,
      documentoUrl: permiso.documentoUrl ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const payload: UpdatePermisoPayload = {
        vigenciaDesde: data.vigenciaDesde,
        vigenciaHasta: data.vigenciaHasta,
        status: data.status,
        documentoUrl:
          data.documentoUrl && data.documentoUrl.trim() ? data.documentoUrl : null,
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
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}
