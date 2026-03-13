"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { silentRefresh } from "@/shared/lib/api";
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
 * En rutas de invitado (login, register).
 * Si ya hay sesión válida (accessToken en memoria o cookie vigente), redirige al destino.
 */
export function GuestRedirect({ children, returnTo }: GuestRedirectProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const target = safeReturnTo(returnTo) ?? "/select-organization";

  type CheckStatus = "idle" | "checking" | "guest";
  const [status, setStatus] = useState<CheckStatus>(
    accessToken ? "idle" : "idle",
  );

  useEffect(() => {
    if (accessToken) {
      router.replace(target);
      return;
    }

    let cancelled = false;

    const check = async () => {
      setStatus("checking");
      const token = await silentRefresh();
      if (cancelled) return;

      if (token) {
        router.replace(target);
      } else {
        setStatus("guest");
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [accessToken, router, target]);

  if (status !== "guest") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  return <>{children}</>;
}
