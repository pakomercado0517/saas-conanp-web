"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, Loader2, Building2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface DependenciaUserBlockProps {
  dependenciaId: string;
}

/**
 * Bloque de usuario en sidebar de dependencia: selector de contexto y cierre de sesión.
 */
export function DependenciaUserBlock({
  dependenciaId,
}: DependenciaUserBlockProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative border-t border-slate-800 p-4" ref={containerRef}>
      <div className="flex items-center gap-3 p-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--primary)/20 font-bold text-(--primary)">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {user?.name ?? user?.email ?? "Usuario"}
          </p>
          <p className="truncate text-xs text-slate-500">Dependencia</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Opciones de cuenta"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <Building2 className="size-5" aria-hidden />
        </button>
      </div>

      {open && (
        <div
          className="absolute bottom-full left-0 right-0 z-50 mb-1 min-w-40 rounded-lg border border-slate-700 bg-(--navy-sidebar) py-1 shadow-xl"
          role="menu"
          aria-label="Opciones de cuenta"
        >
          <Link
            href="/select-organization"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
            role="menuitem"
          >
            <Building2 className="size-4 shrink-0" aria-hidden />
            Todas las dependencias
          </Link>
          <Link
            href={`/dependencias/${dependenciaId}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
            role="menuitem"
          >
            Panel de esta dependencia
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-white/5 hover:text-red-300 disabled:opacity-70"
            role="menuitem"
            aria-busy={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <LogOut className="size-4 shrink-0" aria-hidden />
            )}
            {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
        </div>
      )}
    </div>
  );
}
