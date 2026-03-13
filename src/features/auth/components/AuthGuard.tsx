"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { silentRefresh } from "@/shared/lib/api";
import * as authApi from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Envuelve rutas que requieren sesión.
 * Si no hay accessToken + user en memoria, intenta recuperar la sesión via cookie (silentRefresh + /me).
 * Si falla, redirige a /auth/login preservando returnTo.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const isReady = Boolean(accessToken && user);
  const [failed, setFailed] = useState(false);

  const redirectToLogin = useCallback(() => {
    const returnTo = pathname ? encodeURIComponent(pathname) : "";
    const query = returnTo ? `?returnTo=${returnTo}` : "";
    router.replace(`/auth/login${query}`);
  }, [router, pathname]);

  useEffect(() => {
    if (isReady) return;

    let cancelled = false;

    const restore = async () => {
      const token = await silentRefresh();
      if (cancelled) return;

      if (!token) {
        setFailed(true);
        redirectToLogin();
        return;
      }

      try {
        const userData = await authApi.me();
        if (cancelled) return;
        setUser({
          id: userData.userId,
          email: userData.email,
          name: userData.email,
        });
      } catch {
        if (cancelled) return;
        setFailed(true);
        redirectToLogin();
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [isReady, setUser, redirectToLogin]);

  if (isReady) return <>{children}</>;

  if (failed) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-sm text-slate-500">Cargando…</p>
    </div>
  );
}
