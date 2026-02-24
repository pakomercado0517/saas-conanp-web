"use client";

import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 py-10 dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-(--slate-text)">
            CONANP ERP v2.4
          </span>
          <nav className="flex gap-4" aria-label="Enlaces legales y soporte">
            <Link
              href="#"
              className="text-xs text-(--slate-text) transition-colors hover:text-(--cyan-accent)"
            >
              Términos
            </Link>
            <Link
              href="#"
              className="text-xs text-(--slate-text) transition-colors hover:text-(--cyan-accent)"
            >
              Privacidad
            </Link>
            <Link
              href="#"
              className="text-xs text-(--slate-text) transition-colors hover:text-(--cyan-accent)"
            >
              Soporte técnico
            </Link>
          </nav>
        </div>
        <p className="text-xs text-(--slate-text)">
          © {new Date().getFullYear()} Comisión Nacional de Áreas Naturales
          Protegidas. México.
        </p>
      </div>
    </footer>
  );
}
