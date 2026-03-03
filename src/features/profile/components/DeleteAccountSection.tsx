"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useDeleteAccount } from "../hooks/useDeleteAccount";

export function DeleteAccountSection() {
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const { remove, isPending, error } = useDeleteAccount();

  const CONFIRM_PHRASE = "eliminar mi cuenta";

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== CONFIRM_PHRASE) return;
    try {
      await remove();
    } catch {
      // Error manejado por mutation
    }
  };

  return (
    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
      <h3 className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">
        Zona de peligro
      </h3>
      <p className="mb-4 text-sm text-red-700 dark:text-red-400">
        Al eliminar tu cuenta se perderán todos tus datos de forma permanente. Esta acción no se puede deshacer.
      </p>

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2"
        >
          Eliminar mi cuenta
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-red-700 dark:text-red-400">
            Escribe <strong>{CONFIRM_PHRASE}</strong> para confirmar:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            className="w-full max-w-md rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-red-700 dark:bg-slate-800 dark:text-white"
            aria-label="Confirmar eliminación de cuenta"
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {getApiErrorMessage(error)}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending || confirmText.toLowerCase() !== CONFIRM_PHRASE}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {isPending ? "Eliminando…" : "Eliminar cuenta definitivamente"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
