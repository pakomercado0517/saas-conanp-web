"use client";

import { useState } from "react";
import { X, Ticket } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useCreateProductoAcceso } from "../hooks/useProductoAccesoMutations";
import { ProductoAccesoForm } from "./ProductoAccesoForm";
import type { CreateProductoAccesoFormData } from "../schemas/producto-acceso.schema";
import type { CreateProductoAccesoPayload } from "../types";

interface ProductoAccesoCreateDialogProps {
  areaId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductoAccesoCreateDialog({
  areaId,
  open,
  onClose,
  onSuccess,
}: ProductoAccesoCreateDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { create, isPending } = useCreateProductoAcceso(areaId);

  const handleSubmit = async (data: CreateProductoAccesoFormData) => {
    setServerError(null);
    try {
      const payload: CreateProductoAccesoPayload = {
        name: data.name,
        tipo: data.tipo,
        vigenciaDias: data.vigenciaDias,
        precioReferencia: data.precioReferencia ?? null,
        active: data.active ?? true,
      };
      await create(payload);
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
            Nuevo producto de acceso
          </h2>
        </div>

        <ProductoAccesoForm
          mode="create"
          areaId={areaId}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isPending={isPending}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
