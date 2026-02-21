"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import { ApiError, getApiErrorMessage } from "@/shared/types/api";
import * as authApi from "../services/auth.api";
import { registerSchema, type RegisterFormData } from "../schemas/auth.schema";

const defaultValues: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register: registerField,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setSuccessMessage(res.message ?? "Revisa tu correo electrónico para verificar tu cuenta.");
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (err instanceof ApiError && err.details.length > 0) {
        err.details.forEach(({ campo, mensaje }) => {
          const key = campo as keyof RegisterFormData;
          if (key in defaultValues) {
            setError(key, { type: "server", message: mensaje });
          }
        });
      } else {
        setServerError(message);
      }
    }
  }

  async function handleResendVerification() {
    const email = getValues("email");
    if (!email) return;
    setResendLoading(true);
    setServerError(null);
    try {
      await authApi.resendVerification({ email });
      setSuccessMessage(
        "Si el correo está registrado y no verificado, recibirás un nuevo enlace de verificación."
      );
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  }

  if (successMessage) {
    return (
      <div className="mt-8 space-y-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">{successMessage}</p>
          <p className="mt-2 text-xs text-slate-500">
            Revisa tu bandeja de entrada y carpeta de spam.
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="mt-3 text-sm font-medium text-(--cyan-accent) hover:text-(--cyan-hover) disabled:opacity-70"
          >
            {resendLoading ? "Enviando…" : "Reenviar correo de verificación"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {serverError}
        </div>
      )}
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep)"
        >
          Nombre completo
        </label>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
            {...registerField("name")}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep)"
        >
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@conanp.gob.mx"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
            {...registerField("email")}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep)"
        >
          Contraseña
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
            {...registerField("password")}
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.password.message}
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
        <UserPlus className="h-5 w-5" aria-hidden />
        {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Al registrarte, recibirás un correo para verificar tu cuenta.
      </p>
    </form>
  );
}
