"use client";

import { X, Loader2 } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface CancelConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isPending: boolean;
  periodEnd: string;
  error?: string | null;
}

export function CancelConfirmDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  periodEnd,
  error,
}: CancelConfirmDialogProps) {
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

        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Cancelar suscripción
        </h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          La suscripción seguirá activa hasta el{" "}
          <strong>{formatDate(periodEnd)}</strong>. Después de esa fecha no se
          renovará y perderás el acceso a las funciones del plan.
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          ¿Deseas continuar?
        </p>

        {error && (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            No, mantener
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-70 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            Sí, cancelar al final
          </button>
        </div>
      </div>
    </div>
  );
}
