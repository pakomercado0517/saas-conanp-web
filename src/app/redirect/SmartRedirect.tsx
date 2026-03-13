"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { listDependencias } from "@/features/dependencias/services/dependencias.api";
import { listDependenciaAreas } from "@/features/dependencias/services/dependencias.api";

type RedirectState = "loading" | "redirecting" | "error";

export function SmartRedirect() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [state, setState] = useState<RedirectState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/auth/login");
      return;
    }

    let cancelled = false;

    async function resolve() {
      try {
        const depRes = await listDependencias({});
        const deps = depRes.data;

        if (cancelled) return;

        // Sin dependencias: lleva directo al flujo de creación inicial
        if (deps.length === 0) {
          router.replace("/dependencias/nueva");
          return;
        }

        // Varias dependencias: usa el selector para elegir contexto
        if (deps.length > 1) {
          router.replace("/select-organization");
          return;
        }

        const singleDep = deps[0];
        const areasRes = await listDependenciaAreas(singleDep.id, {});
        const areas = areasRes.data;

        if (cancelled) return;

        // Una dependencia sin áreas: abre el hub para crear la primera área
        if (areas.length === 0) {
          router.replace(`/dependencias/${singleDep.id}`);
          return;
        }

        // Una sola área: entra directo al dashboard de área
        if (areas.length === 1) {
          router.replace(`/areas/${areas[0].id}`);
          return;
        }

        // Varias áreas dentro de una dependencia: vuelve al hub
        router.replace(`/dependencias/${singleDep.id}`);
      } catch {
        if (!cancelled) {
          setState("error");
          setErrorMsg("No se pudo determinar tu destino. Intenta de nuevo.");
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [accessToken, router]);

  if (state === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--light-grey) dark:bg-(--navy-deep)">
        <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
        <button
          type="button"
          onClick={() => {
            setState("loading");
            router.refresh();
          }}
          className="rounded-lg bg-(--cyan-accent) px-4 py-2 text-sm font-bold text-(--navy-deep) hover:bg-(--cyan-hover)"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--light-grey) dark:bg-(--navy-deep)">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-(--cyan-accent)" />
        <p className="text-sm text-(--slate-text)">Preparando tu espacio...</p>
      </div>
    </div>
  );
}
