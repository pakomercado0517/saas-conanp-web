"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn } from "lucide-react";
import { ApiError, getApiErrorMessage, getApiErrorCode } from "@/shared/types/api";
import { getSuggestedActionForCode } from "@/shared/lib/errorActions";
import { useAuth } from "../hooks/useAuth";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";

const defaultValues: LoginFormData = {
  email: "",
  password: "",
};

interface LoginFormProps {
  /** URL a la que redirigir tras login (ej. dashboard de organización). */
  returnTo?: string | null;
}

export function LoginForm({ returnTo }: LoginFormProps) {
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverErrorCode, setServerErrorCode] = useState<string | undefined>(undefined);
  const { login } = useAuth();
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    setServerErrorCode(undefined);
    try {
      await login(data.email, data.password, returnTo);
    } catch (err) {
      const message = getApiErrorMessage(err);
      const code = getApiErrorCode(err);
      if (err instanceof ApiError && err.details.length > 0) {
        err.details.forEach(({ campo, mensaje }) => {
          if (campo === "email" || campo === "password") {
            setError(campo, { type: "server", message: mensaje });
          }
        });
      } else {
        setServerError(message);
        setServerErrorCode(code);
      }
    }
  }

  const suggestedAction = getSuggestedActionForCode(serverErrorCode);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300" role="alert">
          <p>{serverError}</p>
          {suggestedAction?.href && (
            <Link
              href={suggestedAction.href}
              className="mt-2 inline-block font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {suggestedAction.label}
            </Link>
          )}
        </div>
      )}
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
            autoComplete="current-password"
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

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-(--navy-deep) focus:ring-(--cyan-accent)/50"
          />
          <span className="text-sm text-slate-600">Recordarme</span>
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-(--cyan-accent) hover:text-(--cyan-hover)"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light) disabled:opacity-70"
      >
        <LogIn className="h-5 w-5" aria-hidden />
        {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
