"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ListChecks,
} from "lucide-react";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { useActivoRequisitoCatalogo } from "@/features/activos/hooks/useActivoRequisitoCatalogo";
import {
  useCreateActivoRequisitoCatalogoItem,
  useUpdateActivoRequisitoCatalogoItem,
  useDeleteActivoRequisitoCatalogoItem,
} from "@/features/activos/hooks/useActivoRequisitoCatalogoMutations";
import type {
  ActivoRequisitoCatalogoItem,
  TipoActivoCatalogo,
} from "@/features/activos/types";
import {
  createActivoRequisitoCatalogoSchema,
  updateActivoRequisitoCatalogoSchema,
  type CreateActivoRequisitoCatalogoFormData,
  type UpdateActivoRequisitoCatalogoFormData,
} from "@/features/activos/schemas/activo.schema";
import { getApiErrorMessage } from "@/shared/types/api";

const TIPO_ACTIVO_OPTIONS: { value: TipoActivoCatalogo; label: string }[] = [
  { value: "embarcacion", label: "Embarcación" },
  { value: "vehiculo", label: "Vehículo" },
  { value: "guia", label: "Guía" },
  { value: "equipo", label: "Equipo" },
];

const TIPO_DATO_LABELS: Record<string, string> = {
  string: "Texto",
  date: "Fecha",
  number: "Número",
};

const DEFAULT_ACCESS_DENIED =
  "Solo los administradores del área pueden configurar el catálogo de requisitos.";

export interface RequisitosCatalogoPanelProps {
  /** ID de organización (ANP) para API y fallback cuando el catálogo se lista por dependencia */
  organizationId: string;
  /** Si existe, operaciones CRUD usan la API por dependencia */
  dependenciaId?: string | null;
  canManage: boolean;
  /** Subtítulo bajo el título principal (solo si showPageHeader es true) */
  pageDescription: string;
  showPageHeader?: boolean;
  accessDeniedMessage?: string;
}

export function RequisitosCatalogoPanel({
  organizationId,
  dependenciaId,
  canManage,
  pageDescription,
  showPageHeader = true,
  accessDeniedMessage = DEFAULT_ACCESS_DENIED,
}: RequisitosCatalogoPanelProps) {
  const catalogOptions = { dependenciaId: dependenciaId ?? undefined };
  const [tipoActivoFilter, setTipoActivoFilter] = useState<
    TipoActivoCatalogo | ""
  >("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<ActivoRequisitoCatalogoItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: catalogRaw = [], isLoading, isError, error } =
    useActivoRequisitoCatalogo(organizationId, catalogOptions);
  const catalogItems =
    tipoActivoFilter === ""
      ? catalogRaw
      : catalogRaw.filter((c) => c.tipoActivo === tipoActivoFilter);
  const createMutation = useCreateActivoRequisitoCatalogoItem(
    organizationId,
    catalogOptions
  );
  const updateMutation = useUpdateActivoRequisitoCatalogoItem(
    organizationId,
    catalogOptions
  );
  const deleteMutation = useDeleteActivoRequisitoCatalogoItem(
    organizationId,
    catalogOptions
  );

  if (!canManage) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-(--slate-text) dark:text-slate-300">
          {accessDeniedMessage}
        </p>
      </div>
    );
  }

  const sortedItems = [...catalogItems].sort(
    (a, b) => a.orden - b.orden || a.key.localeCompare(b.key)
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
          <select
            value={tipoActivoFilter}
            onChange={(e) =>
              setTipoActivoFilter((e.target.value || "") as TipoActivoCatalogo | "")
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            aria-label="Filtrar por tipo de activo"
          >
            <option value="">Todos los tipos</option>
            {TIPO_ACTIVO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setModalMode("create");
              setServerError(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-4 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
          >
            <Plus className="size-4" aria-hidden />
            Añadir entrada
          </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {showPageHeader ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
              <ListChecks className="size-5 text-(--cyan-accent)" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--navy-deep) dark:text-white">
                Catálogo de requisitos
              </h1>
              <p className="text-sm text-(--slate-text) dark:text-slate-400">
                {pageDescription}
              </p>
            </div>
          </div>
          {toolbar}
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {toolbar}
        </div>
      )}

      {(serverError || (isError && error)) && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {serverError ?? getApiErrorMessage(error)}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-(--cyan-accent)" aria-hidden />
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-(--slate-text) dark:text-slate-400">
            {tipoActivoFilter
              ? "No hay entradas en el catálogo para este tipo de activo."
              : "No hay entradas en el catálogo. Añade la primera."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 font-semibold text-(--navy-deep) dark:text-white">
                  Tipo activo
                </th>
                <th className="px-4 py-3 font-semibold text-(--navy-deep) dark:text-white">
                  Clave
                </th>
                <th className="px-4 py-3 font-semibold text-(--navy-deep) dark:text-white">
                  Etiqueta
                </th>
                <th className="px-4 py-3 font-semibold text-(--navy-deep) dark:text-white">
                  Tipo dato
                </th>
                <th className="px-4 py-3 font-semibold text-(--navy-deep) dark:text-white">
                  Requerido
                </th>
                <th className="px-4 py-3 font-semibold text-(--navy-deep) dark:text-white">
                  Documento
                </th>
                <th className="px-4 py-3 font-semibold text-(--navy-deep) dark:text-white">
                  Orden
                </th>
                <th className="px-4 py-3 font-semibold text-(--navy-deep) dark:text-white">
                  Activo
                </th>
                <th className="px-4 py-3 font-semibold text-(--navy-deep) dark:text-white">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 dark:border-slate-700"
                >
                  <td className="px-4 py-3 text-(--slate-text) dark:text-slate-300">
                    {TIPO_ACTIVO_OPTIONS.find((o) => o.value === item.tipoActivo)
                      ?.label ?? item.tipoActivo}
                  </td>
                  <td className="px-4 py-3 font-medium text-(--navy-deep) dark:text-white">
                    {item.key}
                  </td>
                  <td className="px-4 py-3 text-(--slate-text) dark:text-slate-300">
                    {item.label ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-(--slate-text) dark:text-slate-300">
                    {TIPO_DATO_LABELS[item.tipoDato] ?? item.tipoDato}
                  </td>
                  <td className="px-4 py-3">
                    {item.requerido ? "Sí" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    {item.requiereDocumento ? "Sí" : "No"}
                  </td>
                  <td className="px-4 py-3 text-(--slate-text) dark:text-slate-300">
                    {item.orden}
                  </td>
                  <td className="px-4 py-3">
                    {item.activo ? "Sí" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setModalMode("edit");
                          setServerError(null);
                        }}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-(--cyan-accent) dark:hover:bg-slate-700"
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </button>
                      {deleteConfirmId === item.id ? (
                        <span className="flex items-center gap-1 text-xs">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await deleteMutation.mutateAsync(item.id);
                                setDeleteConfirmId(null);
                              } catch (err) {
                                setServerError(getApiErrorMessage(err));
                              }
                            }}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-slate-500 hover:underline"
                          >
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalMode === "create" && (
        <CreateCatalogoItemModal
          onClose={() => setModalMode(null)}
          onSuccess={() => setModalMode(null)}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          isPending={createMutation.isPending}
          onServerError={setServerError}
        />
      )}
      {modalMode === "edit" && editingItem && (
        <EditCatalogoItemModal
          key={editingItem.id}
          item={editingItem}
          onClose={() => {
            setModalMode(null);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setModalMode(null);
            setEditingItem(null);
          }}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({
              catalogoId: editingItem.id,
              payload: data,
            });
          }}
          isPending={updateMutation.isPending}
          onServerError={setServerError}
        />
      )}
    </div>
  );
}

/** Vista en dashboard del área (requiere AreaContextProvider). */
export interface RequisitosCatalogoContentProps {
  areaId: string;
}

export function RequisitosCatalogoContent({
  areaId,
}: RequisitosCatalogoContentProps) {
  const { role, dependenciaId } = useAreaContext();
  return (
    <RequisitosCatalogoPanel
      organizationId={areaId}
      dependenciaId={dependenciaId}
      canManage={role === "admin"}
      pageDescription="Define los requisitos por tipo de activo para esta área."
    />
  );
}

// ——— Modal crear entrada ———

interface CreateCatalogoItemModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: CreateActivoRequisitoCatalogoFormData) => Promise<void>;
  isPending: boolean;
  onServerError: (msg: string | null) => void;
}

function CreateCatalogoItemModal({
  onClose,
  onSuccess,
  onSubmit,
  isPending,
  onServerError,
}: CreateCatalogoItemModalProps) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<CreateActivoRequisitoCatalogoFormData>({
      resolver: zodResolver(createActivoRequisitoCatalogoSchema),
      defaultValues: {
        tipoActivo: "equipo",
        key: "",
        label: "",
        tipoDato: "string",
        requerido: false,
        requiereDocumento: false,
        orden: 0,
        activo: true,
      },
    });

  async function handleFormSubmit(data: CreateActivoRequisitoCatalogoFormData) {
    onServerError(null);
    try {
      await onSubmit(data);
      onSuccess();
    } catch (err) {
      onServerError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>
        <h2 className="mb-4 text-lg font-bold text-(--navy-deep) dark:text-white">
          Añadir entrada al catálogo
        </h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Tipo de activo
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("tipoActivo")}
            >
              {TIPO_ACTIVO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.tipoActivo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipoActivo.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Clave
            </label>
            <input
              type="text"
              placeholder="ej. permiso_operacion"
              className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("key")}
            />
            {errors.key && (
              <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Etiqueta (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Permiso de operación"
              className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("label")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Tipo de dato
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("tipoDato")}
            >
              <option value="string">Texto</option>
              <option value="date">Fecha</option>
              <option value="number">Número</option>
            </select>
            {errors.tipoDato && (
              <p className="mt-1 text-sm text-red-600">{errors.tipoDato.message}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" {...register("requerido")} className="rounded border-slate-300" />
              Requerido
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" {...register("requiereDocumento")} className="rounded border-slate-300" />
              Requiere documento
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" {...register("activo")} className="rounded border-slate-300" />
              Activo
            </label>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Orden
            </label>
            <input
              type="number"
              min={0}
              className="w-24 rounded-lg border border-slate-200 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("orden", { valueAsNumber: true })}
            />
            {errors.orden && (
              <p className="mt-1 text-sm text-red-600">{errors.orden.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70"
            >
              {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ——— Modal editar entrada ———

interface EditCatalogoItemModalProps {
  item: ActivoRequisitoCatalogoItem;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: UpdateActivoRequisitoCatalogoFormData) => Promise<void>;
  isPending: boolean;
  onServerError: (msg: string | null) => void;
}

function EditCatalogoItemModal({
  item,
  onClose,
  onSuccess,
  onSubmit,
  isPending,
  onServerError,
}: EditCatalogoItemModalProps) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<UpdateActivoRequisitoCatalogoFormData>({
      resolver: zodResolver(updateActivoRequisitoCatalogoSchema),
      defaultValues: {
        label: item.label ?? "",
        tipoDato: item.tipoDato,
        requerido: item.requerido,
        requiereDocumento: item.requiereDocumento,
        orden: item.orden,
        activo: item.activo,
      },
    });

  async function handleFormSubmit(data: UpdateActivoRequisitoCatalogoFormData) {
    onServerError(null);
    try {
      await onSubmit(data);
      onSuccess();
    } catch (err) {
      onServerError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>
        <h2 className="mb-4 text-lg font-bold text-(--navy-deep) dark:text-white">
          Editar entrada
        </h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Tipo: {TIPO_ACTIVO_OPTIONS.find((o) => o.value === item.tipoActivo)?.label ?? item.tipoActivo} · Clave: {item.key}
        </p>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Etiqueta (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Permiso de operación"
              className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("label")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Tipo de dato
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("tipoDato")}
            >
              <option value="string">Texto</option>
              <option value="date">Fecha</option>
              <option value="number">Número</option>
            </select>
            {errors.tipoDato && (
              <p className="mt-1 text-sm text-red-600">{errors.tipoDato.message}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" {...register("requerido")} className="rounded border-slate-300" />
              Requerido
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" {...register("requiereDocumento")} className="rounded border-slate-300" />
              Requiere documento
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" {...register("activo")} className="rounded border-slate-300" />
              Activo
            </label>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Orden
            </label>
            <input
              type="number"
              min={0}
              className="w-24 rounded-lg border border-slate-200 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("orden", { valueAsNumber: true })}
            />
            {errors.orden && (
              <p className="mt-1 text-sm text-red-600">{errors.orden.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70"
            >
              {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
