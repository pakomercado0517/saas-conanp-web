"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { AreaContextProvider } from "@/features/organizations/context/AreaContext";
import { useCreatePrestadorCompleto } from "../hooks/useCreatePrestadorCompleto";
import { CreatePrestadorForm } from "./CreatePrestadorForm";

interface CreatePrestadorSheetProps {
  areaId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePrestadorSheet({
  areaId,
  open,
  onClose,
  onSuccess,
}: CreatePrestadorSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { create, isPending } = useCreatePrestadorCompleto(areaId);

  const handleSubmit = async (payload: Parameters<typeof create>[0]) => {
    setServerError(null);
    try {
      await create(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-labelledby="create-prestador-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
              <UserPlus className="size-5 text-(--cyan-accent)" aria-hidden />
            </div>
            <h2
              id="create-prestador-title"
              className="text-xl font-bold text-slate-800 dark:text-white"
            >
              Crear prestador
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <AreaContextProvider areaId={areaId}>
            <CreatePrestadorForm
              onSubmit={handleSubmit}
              onCancel={onClose}
              isPending={isPending}
              serverError={serverError}
            />
          </AreaContextProvider>
        </div>
      </div>
    </>
  );
}
