"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, UserPlus, Loader2 } from "lucide-react";
import { ApiError, getApiErrorMessage } from "@/shared/types/api";
import { useCreateDependenciaInvitation } from "../hooks/useCreateDependenciaInvitation";
import {
  createDependenciaInvitationSchema,
  type CreateDependenciaInvitationFormData,
} from "../schemas/dependencia.schema";

const ROLE_OPTIONS = [
  { value: "admin" as const, label: "Administrador", desc: "Acceso completo" },
  { value: "gestor" as const, label: "Gestor", desc: "Gestión operativa" },
  {
    value: "prestador" as const,
    label: "Prestador",
    desc: "Prestador de servicios",
  },
  {
    value: "observador" as const,
    label: "Observador",
    desc: "Solo lectura",
  },
];

interface CreateDependenciaInvitationDialogProps {
  dependenciaId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateDependenciaInvitationDialog({
  dependenciaId,
  open,
  onClose,
  onSuccess,
}: CreateDependenciaInvitationDialogProps) {
  const { create, isPending } =
    useCreateDependenciaInvitation(dependenciaId);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateDependenciaInvitationFormData>({
    resolver: zodResolver(createDependenciaInvitationSchema),
    defaultValues: { email: "", role: undefined },
  });

  async function onSubmit(data: CreateDependenciaInvitationFormData) {
    setServerError(null);
    setSuccessMsg(null);
    try {
      const res = await create(data);
      setSuccessMsg(res.message ?? "Invitación enviada correctamente.");
      reset();
      onSuccess?.();
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (err instanceof ApiError && err.details.length > 0) {
        err.details.forEach(({ campo, mensaje }) => {
          if (campo === "email" || campo === "role") {
            setError(campo, { type: "server", message: mensaje });
          }
        });
      } else {
        setServerError(message);
      }
    }
  }

  function handleClose() {
    setSuccessMsg(null);
    setServerError(null);
    reset();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
            <UserPlus className="size-5 text-(--cyan-accent)" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-(--navy-deep) dark:text-white">
            Invitar miembro
          </h2>
        </div>

        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
            {successMsg}
          </div>
        )}

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
              htmlFor="inv-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300"
            >
              Correo electrónico
            </label>
            <input
              id="inv-email"
              type="email"
              placeholder="usuario@ejemplo.com"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-300">
              Rol
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer flex-col rounded-lg border border-slate-200 px-3 py-2.5 transition-colors has-[:checked]:border-(--cyan-accent) has-[:checked]:bg-(--cyan-accent)/10 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    className="sr-only"
                    {...register("role")}
                  />
                  <span className="text-sm font-semibold text-(--navy-deep) dark:text-white">
                    {opt.label}
                  </span>
                  <span className="text-xs text-(--slate-text)">{opt.desc}</span>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
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
              Enviar invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
