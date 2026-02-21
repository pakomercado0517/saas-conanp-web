"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowRight } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import * as authApi from "../services/auth.api";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas/auth.schema";

const defaultValues: ForgotPasswordFormData = {
  email: "",
};

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues,
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setServerError(null);
    try {
      await authApi.forgotPassword({ email: data.email });
      setSuccessMessage(
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
      setSubmitted(true);
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  }

  if (submitted && successMessage) {
    return (
      <div className="mt-6 space-y-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">
            {successMessage}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Revisa tu bandeja de entrada y carpeta de spam.
          </p>
        </div>
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light)"
        >
          Volver a Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {serverError}
        </div>
      )}
      <p className="text-sm text-slate-600">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer
        tu contraseña.
      </p>
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light) disabled:opacity-70"
      >
        {isSubmitting ? "Enviando…" : "Enviar enlace de recuperación"}
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );
}
