"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductoAccesoSchema,
  updateProductoAccesoSchema,
  type CreateProductoAccesoFormData,
  type UpdateProductoAccesoFormData,
} from "../schemas/producto-acceso.schema";
import type { ProductoAcceso } from "../types";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300";

interface ProductoAccesoFormBaseProps {
  areaId: string;
  onCancel: () => void;
  isPending: boolean;
  serverError?: string | null;
}

interface ProductoAccesoFormCreateProps extends ProductoAccesoFormBaseProps {
  mode: "create";
  onSubmit: (data: CreateProductoAccesoFormData) => Promise<void>;
}

interface ProductoAccesoFormEditProps extends ProductoAccesoFormBaseProps {
  mode: "edit";
  producto: ProductoAcceso;
  onSubmit: (data: UpdateProductoAccesoFormData) => Promise<void>;
}

type ProductoAccesoFormProps =
  | ProductoAccesoFormCreateProps
  | ProductoAccesoFormEditProps;

export function ProductoAccesoForm(props: ProductoAccesoFormProps) {
  const { onCancel, isPending, serverError } = props;
  const isCreate = props.mode === "create";

  const form = useForm<
    CreateProductoAccesoFormData | UpdateProductoAccesoFormData
  >({
    resolver: zodResolver(
      isCreate ? createProductoAccesoSchema : updateProductoAccesoSchema
    ) as Resolver<CreateProductoAccesoFormData | UpdateProductoAccesoFormData>,
    defaultValues:
      props.mode === "edit"
        ? {
            name: props.producto.name,
            tipo: props.producto.tipo,
            vigenciaDias: props.producto.vigenciaDias,
            precioReferencia: props.producto.precioReferencia ?? undefined,
            active: props.producto.active,
          }
        : {
            name: "",
            tipo: "brazalete",
            vigenciaDias: 1,
            precioReferencia: undefined,
            active: true,
          },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (props.mode === "create") {
      await props.onSubmit(data as unknown as CreateProductoAccesoFormData);
    } else {
      await props.onSubmit(data as unknown as UpdateProductoAccesoFormData);
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="producto-name" className={labelClass}>
          Nombre
        </label>
        <input
          id="producto-name"
          type="text"
          placeholder="Nombre del producto"
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
        <label htmlFor="producto-tipo" className={labelClass}>
          Tipo
        </label>
        <select
          id="producto-tipo"
          className={inputClass}
          {...form.register("tipo")}
          disabled={!isCreate}
        >
          <option value="brazalete">Brazalete</option>
          <option value="pasaporte">Pasaporte</option>
        </select>
        {form.formState.errors.tipo && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.tipo.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="producto-vigencia" className={labelClass}>
          Vigencia (días)
        </label>
        <input
          id="producto-vigencia"
          type="number"
          min={1}
          className={inputClass}
          {...form.register("vigenciaDias", { valueAsNumber: true })}
        />
        {form.formState.errors.vigenciaDias && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.vigenciaDias.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="producto-precio" className={labelClass}>
          Precio de referencia (opcional)
        </label>
        <input
          id="producto-precio"
          type="number"
          min={0}
          step="0.01"
          placeholder="Opcional"
          className={inputClass}
          {...form.register("precioReferencia")}
        />
        {form.formState.errors.precioReferencia && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.precioReferencia.message}
          </p>
        )}
      </div>

      {!isCreate && (
        <div className="flex items-center gap-2">
          <input
            id="producto-active"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            {...form.register("active")}
          />
          <label
            htmlFor="producto-active"
            className="text-sm text-slate-700 dark:text-slate-300"
          >
            Activo
          </label>
        </div>
      )}

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
          {isPending ? "Guardando…" : isCreate ? "Crear producto" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
