"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate with auth API
    console.log({ email, password, rememberMe });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--navy-deep)]"
        >
          Email Address
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

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--navy-deep)]"
        >
          Password
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-[var(--navy-deep)] placeholder:text-slate-400 focus:border-[var(--cyan-accent)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--cyan-accent)]/50"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[var(--navy-deep)] focus:ring-[var(--cyan-accent)]/50"
          />
          <span className="text-sm text-slate-600">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[var(--cyan-accent)] hover:text-[var(--cyan-hover)]"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--navy-deep)] py-3 font-bold text-white shadow-md transition-colors hover:bg-[var(--navy-light)]"
      >
        <LogIn className="h-5 w-5" aria-hidden />
        Sign In
      </button>
    </form>
  );
}
