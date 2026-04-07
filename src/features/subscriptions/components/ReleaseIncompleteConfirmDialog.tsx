"use client";

import { X, Loader2 } from "lucide-react";

interface ReleaseIncompleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isPending: boolean;
  error?: string | null;
}

export function ReleaseIncompleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  error,
}: ReleaseIncompleteConfirmDialogProps) {
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
          Volver a plan gratuito
        </h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Se cancelará el intento de suscripción pendiente en Stripe (si aplica)
          y la dependencia quedará en el plan gratuito. Después podrás contratar
          de nuevo con otro plan o ciclo.
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          ¿Deseas continuar?
        </p>

        {error ? (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            Sí, liberar
          </button>
        </div>
      </div>
    </div>
  );
}
