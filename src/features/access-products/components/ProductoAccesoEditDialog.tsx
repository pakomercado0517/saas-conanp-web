"use client";

import { useState } from "react";
import { X, Ticket } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useUpdateProductoAcceso } from "../hooks/useProductoAccesoMutations";
import { ProductoAccesoForm } from "./ProductoAccesoForm";
import type { UpdateProductoAccesoFormData } from "../schemas/producto-acceso.schema";
import type { ProductoAcceso, UpdateProductoAccesoPayload } from "../types";

interface ProductoAccesoEditDialogProps {
  producto: ProductoAcceso;
  areaId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductoAccesoEditDialog({
  producto,
  areaId,
  open,
  onClose,
  onSuccess,
}: ProductoAccesoEditDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { update, isPending } = useUpdateProductoAcceso(areaId, producto.id);

  const handleSubmit = async (data: UpdateProductoAccesoFormData) => {
    setServerError(null);
    try {
      const payload: UpdateProductoAccesoPayload = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.tipo !== undefined) payload.tipo = data.tipo;
      if (data.vigenciaDias !== undefined)
        payload.vigenciaDias = data.vigenciaDias;
      if (data.precioReferencia !== undefined)
        payload.precioReferencia = data.precioReferencia ?? null;
      if (data.active !== undefined) payload.active = data.active;
      await update(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

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
            <Ticket className="size-5 text-(--cyan-accent)" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Editar producto
          </h2>
        </div>

        <ProductoAccesoForm
          mode="edit"
          areaId={areaId}
          producto={producto}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isPending={isPending}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
