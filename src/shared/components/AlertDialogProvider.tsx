"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

export type AlertDialogPayload = {
  title: string;
  description?: string;
  actionLabel?: string;
};

export type ConfirmDialogPayload = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
};

type AlertDialogContextValue = {
  open: (payload: AlertDialogPayload) => void;
  confirm: (payload: ConfirmDialogPayload) => Promise<boolean>;
  close: () => void;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

export function useAlertDialog(): AlertDialogContextValue {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) {
    throw new Error("useAlertDialog debe usarse dentro de AlertDialogProvider");
  }
  return ctx;
}

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<AlertDialogPayload | null>(null);
  const [confirmPayload, setConfirmPayload] = useState<ConfirmDialogPayload | null>(null);
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(
    null
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setPayload(null);
    setConfirmPayload(null);
    setConfirmResolver(null);
  }, []);

  const open = useCallback((next: AlertDialogPayload) => {
    setPayload(next);
    setIsOpen(true);
  }, []);

  const confirm = useCallback((next: ConfirmDialogPayload) => {
    return new Promise<boolean>((resolve) => {
      setPayload(null);
      setConfirmPayload(next);
      setConfirmResolver(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const value = useMemo(() => ({ open, confirm, close }), [open, confirm, close]);

  return (
    <AlertDialogContext.Provider value={value}>
      {children}

      {isOpen && payload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
            aria-describedby={payload.description ? "alert-dialog-description" : undefined}
            className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>

            <h2
              id="alert-dialog-title"
              className="text-lg font-bold text-(--navy-deep) dark:text-white"
            >
              {payload.title}
            </h2>
            {payload.description && (
              <p
                id="alert-dialog-description"
                className="mt-2 text-sm text-(--slate-text) dark:text-slate-400"
              >
                {payload.description}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center justify-center rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
              >
                {payload.actionLabel ?? "Entendido"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && confirmPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              confirmResolver?.(false);
              close();
            }}
            aria-hidden
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={
              confirmPayload.description ? "confirm-dialog-description" : undefined
            }
            className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => {
                confirmResolver?.(false);
                close();
              }}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>

            <h2
              id="confirm-dialog-title"
              className="text-lg font-bold text-(--navy-deep) dark:text-white"
            >
              {confirmPayload.title}
            </h2>
            {confirmPayload.description && (
              <p
                id="confirm-dialog-description"
                className="mt-2 text-sm text-(--slate-text) dark:text-slate-400"
              >
                {confirmPayload.description}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  confirmResolver?.(false);
                  close();
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {confirmPayload.cancelLabel ?? "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmResolver?.(true);
                  close();
                }}
                className={
                  confirmPayload.variant === "destructive"
                    ? "inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-500"
                    : "inline-flex items-center justify-center rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
                }
              >
                {confirmPayload.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertDialogContext.Provider>
  );
}

