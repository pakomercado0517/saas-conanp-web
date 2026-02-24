"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";

interface GuestRedirectProps {
  children: React.ReactNode;
  /** Si el usuario ya está autenticado, redirigir aquí en lugar de /select-organization. */
  returnTo?: string | null;
}

function safeReturnTo(returnTo: string | null | undefined): string | null {
  if (!returnTo || typeof returnTo !== "string") return null;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return null;
  return returnTo;
}

/**
 * En rutas de invitado (login, register). Si ya hay sesión válida, redirige a returnTo o /select-organization.
 */
export function GuestRedirect({ children, returnTo }: GuestRedirectProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const refreshAccessToken = useAuthStore((s) => s.refreshAccessToken);
  /** null = pendiente, false = refresh terminó sin token (mostrar contenido) */
  const [refreshDone, setRefreshDone] = useState<boolean | null>(null);

  const target = safeReturnTo(returnTo) ?? "/select-organization";
  const ready = accessToken === null && (refreshToken === null || refreshDone === false);

  useEffect(() => {
    if (accessToken !== null) {
      router.replace(target);
      return;
    }
    if (refreshToken === null) return;
    refreshAccessToken().then((token) => {
      if (token) router.replace(target);
      else setRefreshDone(false);
    });
  }, [accessToken, refreshToken, refreshAccessToken, router, target]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  return <>{children}</>;
}
