"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, UserPlus } from "lucide-react";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return;
    // TODO: integrate with auth API
    console.log({ name, email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
          />
        </div>
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
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@conanp.gob.mx"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
          />
        </div>
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
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
          />
        </div>
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
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
          />
        </div>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light)"
      >
        <UserPlus className="h-5 w-5" aria-hidden />
        Crear cuenta
      </button>

      <p className="text-center text-sm text-slate-500">
        Al registrarte, recibirás un correo para verificar tu cuenta.
      </p>
    </form>
  );
}
