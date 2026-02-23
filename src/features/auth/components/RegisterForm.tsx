"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import { ApiError, getApiErrorMessage } from "@/shared/types/api";
import * as authApi from "../services/auth.api";
import { registerSchema, type RegisterFormData } from "../schemas/auth.schema";

export interface RegisterFormProps {
  invitationId: string;
  defaultEmail: string;
  /** Token del enlace (flujo por enlace); no enviar si se usa invitationProof. */
  token?: string;
  /** Comprobante de verify-email/confirm (flujo por código manual). */
  invitationProof?: string;
}

const getDefaultValues = (
  invitationId: string,
  defaultEmail: string,
  token?: string,
  invitationProof?: string
): RegisterFormData => ({
  name: "",
  email: defaultEmail,
  password: "",
  confirmPassword: "",
  invitationId,
  token: token ?? "",
  invitationProof: invitationProof ?? "",
});

/** True cuando el registro es con invitación (enlace o proof): no hay paso de verificar correo. */
function needsEmailVerification(message: string): boolean {
  return /verificar|correo|revisa tu correo/i.test(message) ?? false;
}

export function RegisterForm({
  invitationId,
  defaultEmail,
  token,
  invitationProof,
}: RegisterFormProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const fromInvitation = Boolean(token || invitationProof);
  const {
    register: registerField,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: getDefaultValues(invitationId, defaultEmail, token, invitationProof),
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        invitationId: data.invitationId,
        ...(data.token ? { token: data.token } : { invitationProof: data.invitationProof }),
      });
      setSuccessMessage(
        res.message ?? (fromInvitation ? "Cuenta creada. Ya puedes iniciar sesión." : "Revisa tu correo electrónico para verificar tu cuenta.")
      );
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (err instanceof ApiError && err.details.length > 0) {
        err.details.forEach(({ campo, mensaje }) => {
          const key = campo as keyof RegisterFormData;
          if (key in getDefaultValues("", "", undefined, undefined)) {
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
    const showResend = !fromInvitation && needsEmailVerification(successMessage);
    return (
      <div className="mt-8 space-y-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">{successMessage}</p>
          {showResend ? (
            <>
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
            </>
          ) : (
            <Link
              href="/auth/login"
              className="mt-4 inline-block rounded-lg bg-(--navy-deep) px-4 py-2 text-sm font-medium text-white hover:bg-(--navy-light)"
            >
              Ir a iniciar sesión
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      {serverError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {serverError}
        </div>
      )}
      <input type="hidden" {...registerField("invitationId")} />
      <input type="hidden" {...registerField("token")} />
      <input type="hidden" {...registerField("invitationProof")} />
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
            readOnly
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-(--navy-deep)"
            {...registerField("email")}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Debe coincidir con el email de la invitación.
        </p>
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
        {fromInvitation
          ? "Al registrarte podrás iniciar sesión de inmediato."
          : "Al registrarte, recibirás un correo para verificar tu cuenta."}
      </p>
    </form>
  );
}
