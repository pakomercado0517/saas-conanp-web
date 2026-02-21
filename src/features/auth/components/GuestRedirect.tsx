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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (accessToken) {
      router.replace("/select-organization");
      return;
    }
    if (!refreshToken) {
      setReady(true);
      return;
    }
    refreshAccessToken().then((token) => {
      if (token) router.replace("/select-organization");
      else setReady(true);
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
