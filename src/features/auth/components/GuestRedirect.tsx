"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";

interface GuestRedirectProps {
  children: React.ReactNode;
}

/**
 * En rutas de invitado (login, register). Si ya hay sesión válida, redirige a /select-organization.
 */
export function GuestRedirect({ children }: GuestRedirectProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const refreshAccessToken = useAuthStore((s) => s.refreshAccessToken);
  /** null = pendiente, false = refresh terminó sin token (mostrar contenido) */
  const [refreshDone, setRefreshDone] = useState<boolean | null>(null);

  const ready = accessToken === null && (refreshToken === null || refreshDone === false);

  useEffect(() => {
    if (accessToken !== null) {
      router.replace("/select-organization");
      return;
    }
    if (refreshToken === null) return;
    refreshAccessToken().then((token) => {
      if (token) router.replace("/select-organization");
      else setRefreshDone(false);
    });
  }, [accessToken, refreshToken, refreshAccessToken, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  return <>{children}</>;
}
