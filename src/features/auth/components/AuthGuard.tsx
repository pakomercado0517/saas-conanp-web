"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Envuelve rutas que requieren sesión. Intenta refresh si hay refreshToken pero no accessToken;
 * si no hay sesión válida, redirige a /login.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const refreshAccessToken = useAuthStore((s) => s.refreshAccessToken);
  /** null = pendiente, true = refresh ok, false = refresh falló */
  const [refreshDone, setRefreshDone] = useState<boolean | null>(null);

  const ready = accessToken !== null || refreshDone === true;
  const checking = accessToken === null && refreshToken !== null && refreshDone === null;

  useEffect(() => {
    if (accessToken !== null) return;
    if (refreshToken === null) {
      router.replace("/login");
      return;
    }
    refreshAccessToken()
      .then((token) => {
        setRefreshDone(!!token);
        if (!token) router.replace("/login");
      })
      .catch(() => {
        setRefreshDone(false);
        router.replace("/login");
      });
  }, [accessToken, refreshToken, refreshAccessToken, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
