"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, User } from "lucide-react";
import { ApiError, getApiErrorMessage } from "@/shared/types/api";
import { useUpdatePrestador } from "../hooks/useUpdatePrestador";
import {
  updatePrestadorSchema,
  type UpdatePrestadorFormData,
} from "../schemas/prestador.schema";
import type { Prestador, PrestadorStatus } from "../types";

const STATUS_OPTIONS: { value: PrestadorStatus; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "suspendido", label: "Suspendido" },
];

interface PrestadorEditDialogProps {
  prestador: Prestador;
  areaId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Si true, muestra el campo status (solo admin/gestor). */
  canEditStatus?: boolean;
}

export function PrestadorEditDialog({
  prestador,
  areaId,
  open,
  onClose,
  onSuccess,
  canEditStatus = false,
}: PrestadorEditDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { update, isPending } = useUpdatePrestador(areaId, prestador.id);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UpdatePrestadorFormData>({
    resolver: zodResolver(updatePrestadorSchema),
    defaultValues: {
      name: prestador.name ?? prestador.User?.name ?? "",
      email: prestador.email ?? prestador.User?.email ?? "",
      phone: prestador.phone ?? "",
      status: canEditStatus ? prestador.status : undefined,
    },
  });

  async function onSubmit(data: UpdatePrestadorFormData) {
    setServerError(null);
    try {
      await update({
        name: data.name,
        email: data.email,
        phone: data.phone,
        ...(canEditStatus && data.status ? { status: data.status } : {}),
      });
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (err instanceof ApiError && err.details.length > 0) {
        err.details.forEach(({ campo, mensaje }) => {
          if (
            campo === "name" ||
            campo === "email" ||
            campo === "phone" ||
            campo === "status"
          ) {
            setError(campo as keyof UpdatePrestadorFormData, {
              type: "server",
              message: mensaje,
            });
          }
        });
      } else {
        setServerError(message);
      }
    }
  }

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
            <User className="size-5 text-(--cyan-accent)" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Editar prestador
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <div>
            <label
              htmlFor="prestador-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Nombre
            </label>
            <input
              id="prestador-name"
              type="text"
              placeholder="Nombre del prestador"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="prestador-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Correo electrónico
            </label>
            <input
              id="prestador-email"
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="prestador-phone"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Teléfono
            </label>
            <input
              id="prestador-phone"
              type="tel"
              placeholder="Opcional"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {canEditStatus && (
            <div>
              <label
                htmlFor="prestador-status"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Estado
              </label>
              <select
                id="prestador-status"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register("status")}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70"
            >
              {isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
