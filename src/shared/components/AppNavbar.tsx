"use client";

import Link from "next/link";
import { Waves, Loader2, RefreshCw } from "lucide-react";

export interface AppNavbarUser {
  name: string;
  email: string;
}

interface AppNavbarProps {
  /** Usuario actual; si no se pasa, no se muestra bloque de usuario */
  user?: AppNavbarUser | null;
  onLogout: () => void;
  isLoggingOut?: boolean;
  /** Si se pasa, se muestra botón Refrescar */
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AppNavbar({
  user,
  onLogout,
  isLoggingOut = false,
  onRefresh,
  isRefreshing = false,
}: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-(--navy-deep)/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-(--navy-deep) dark:text-white"
          aria-label="CONANP ERP - Inicio"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
            <Waves
              className="size-6 text-(--cyan-accent)"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">
              CONANP
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-(--slate-text)">
              ERP v2.4 Ecosystem
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {onRefresh && (
            <>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-(--slate-text) transition-colors hover:bg-slate-100 hover:text-(--navy-deep) dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-70"
                aria-label="Refrescar"
              >
                <RefreshCw
                  className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
                  aria-hidden
                />
                <span>Refrescar</span>
              </button>
              <div
                className="hidden h-8 w-px bg-slate-200 dark:bg-slate-700 sm:block"
                aria-hidden
              />
            </>
          )}

          {user && (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-bold leading-none text-(--navy-deep) dark:text-white">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-(--slate-text)">{user.email}</p>
              </div>
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-(--cyan-accent)/30 bg-(--cyan-accent)/20">
                <span className="text-sm font-bold text-(--cyan-accent)">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-(--cyan-accent) transition-colors hover:text-(--cyan-hover) disabled:opacity-70"
            aria-label="Cerrar sesión"
            aria-busy={isLoggingOut}
          >
            {isLoggingOut && (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            )}
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
