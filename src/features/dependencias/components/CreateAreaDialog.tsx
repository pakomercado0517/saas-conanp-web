"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, MapPin, Loader2 } from "lucide-react";
import { ApiError, getApiErrorMessage } from "@/shared/types/api";
import { useCreateDependenciaArea } from "../hooks/useCreateDependenciaArea";
import {
  createAreaSchema,
  type CreateAreaFormData,
} from "../schemas/dependencia.schema";

const ECOSYSTEM_OPTIONS = [
  { value: "terrestre" as const, label: "Terrestre" },
  { value: "maritimo" as const, label: "Marítimo" },
  { value: "mixto" as const, label: "Mixto" },
];

interface CreateAreaDialogProps {
  dependenciaId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAreaDialog({
  dependenciaId,
  open,
  onClose,
  onSuccess,
}: CreateAreaDialogProps) {
  const { create, isPending } = useCreateDependenciaArea(dependenciaId);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateAreaFormData>({
    resolver: zodResolver(createAreaSchema),
    defaultValues: { name: "", ecosystem_type: undefined },
  });

  async function onSubmit(data: CreateAreaFormData) {
    setServerError(null);
    try {
      await create(data);
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (err instanceof ApiError && err.details.length > 0) {
        err.details.forEach(({ campo, mensaje }) => {
          if (campo === "name" || campo === "ecosystem_type") {
            setError(campo, { type: "server", message: mensaje });
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
            <MapPin className="size-5 text-(--cyan-accent)" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-(--navy-deep) dark:text-white">
            Crear área
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <div>
            <label
              htmlFor="area-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300"
            >
              Nombre del área
            </label>
            <input
              id="area-name"
              type="text"
              placeholder="Ej. Parque Nacional Isla Contoy"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Tipo de ecosistema
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ECOSYSTEM_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium transition-colors has-[:checked]:border-(--cyan-accent) has-[:checked]:bg-(--cyan-accent)/10 has-[:checked]:text-(--cyan-accent) hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    className="sr-only"
                    {...register("ecosystem_type")}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.ecosystem_type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.ecosystem_type.message}
              </p>
            )}
          </div>

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
              Crear área
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
