"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EmailSignupSection() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/register?email=${encodeURIComponent(email.trim())}`);
    } else {
      router.push("/register");
    }
  }

  return (
    <section className="border-t border-slate-200 bg-[var(--light-grey)] py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-8 text-3xl font-bold text-[var(--navy-deep)]">
          ¿Listo para transformar la gestión de su ANP?
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 rounded-lg border bg-white p-2 shadow-sm sm:flex-row"
        >
          <input
            type="email"
            placeholder="correo@organizacion.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border-none px-4 py-3 text-sm outline-none focus:ring-0"
            aria-label="Correo electrónico"
          />
          <button
            type="submit"
            className="rounded bg-[var(--navy-deep)] px-8 py-3 font-bold text-white transition-colors hover:bg-black"
          >
            Empezar Ahora
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-400">
          Sin tarjeta de crédito requerida para el demo inicial.
        </p>
      </div>
    </section>
  );
}
