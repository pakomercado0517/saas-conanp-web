"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate with auth API (POST /api/v1/auth/forgot-password)
    console.log({ email });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mt-6 space-y-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">
            Si existe una cuenta con <strong>{email}</strong>, recibirás un
            correo con instrucciones para recuperar tu contraseña.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Revisa tu bandeja de entrada y carpeta de spam.
          </p>
        </div>
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--navy-deep)] py-3 font-bold text-white shadow-md transition-colors hover:bg-[var(--navy-light)]"
        >
          Volver a Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <p className="text-sm text-slate-600">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer
        tu contraseña.
      </p>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--navy-deep)]"
        >
          Email
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@conanp.gob.mx"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-[var(--navy-deep)] placeholder:text-slate-400 focus:border-[var(--cyan-accent)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--cyan-accent)]/50"
          />
        </div>
      </div>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--navy-deep)] py-3 font-bold text-white shadow-md transition-colors hover:bg-[var(--navy-light)]"
      >
        Enviar enlace de recuperación
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );
}
