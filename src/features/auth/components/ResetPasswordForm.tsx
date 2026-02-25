"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, KeyRound } from "lucide-react";
import { ApiError, getApiErrorMessage } from "@/shared/types/api";
import * as authApi from "../services/auth.api";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas/auth.schema";

interface ResetPasswordFormProps {
  token: string;
  /** Flujo de primera contraseña (cuenta creada por super admin). */
  isInitialSetup?: boolean;
}

export function ResetPasswordForm({ token, isInitialSetup = false }: ResetPasswordFormProps) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setServerError(null);
    try {
      await authApi.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      });
      setSuccess(true);
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (err instanceof ApiError && err.details.length > 0) {
        err.details.forEach(({ campo, mensaje }) => {
          const key = campo as keyof ResetPasswordFormData;
          if (key === "newPassword" || key === "confirmPassword" || key === "token") {
            setError(key, { type: "server", message: mensaje });
          }
        });
      } else {
        setServerError(message);
      }
    }
  }

  if (success) {
    return (
      <div className="mt-6 space-y-5">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-sm text-green-800">Contraseña restablecida exitosamente</p>
          <p className="mt-2 text-xs text-green-700">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        </div>
        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light)"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
      <input type="hidden" {...registerField("token")} value={token} />
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {serverError}
        </div>
      )}
      <div>
        <label
          htmlFor="newPassword"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep)"
        >
          Nueva contraseña
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
            {...registerField("newPassword")}
          />
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.newPassword.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep)"
        >
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
            {...registerField("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light) disabled:opacity-70"
      >
        <KeyRound className="h-5 w-5" aria-hidden />
        {isSubmitting
          ? isInitialSetup
            ? "Creando contraseña…"
            : "Restableciendo…"
          : isInitialSetup
            ? "Crear contraseña y activar cuenta"
            : "Restablecer contraseña"}
      </button>
    </form>
  );
}
