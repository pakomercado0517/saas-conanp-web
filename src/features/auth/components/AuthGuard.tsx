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
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (accessToken) {
      setReady(true);
      setChecking(false);
      return;
    }
    if (!refreshToken) {
      router.replace("/login");
      return;
    }
    refreshAccessToken()
      .then((token) => {
        if (token) setReady(true);
        else router.replace("/login");
      })
      .finally(() => setChecking(false));
  }, [accessToken, refreshToken, refreshAccessToken, router]);

  if (checking && !ready) {
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
