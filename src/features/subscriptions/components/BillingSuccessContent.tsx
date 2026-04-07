"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { ApiError } from "@/shared/types/api";
import {
  clearCheckoutReturnStorage,
  getCheckoutReturnClientSnapshot,
  getCheckoutReturnServerSnapshot,
  subscribeCheckoutReturnNoop,
} from "../lib/checkoutReturnStorage";
import { getCurrentSubscription } from "../services/subscriptions.api";
import type { Subscription } from "../types";

const POLL_MS = 2000;
const MAX_WAIT_MS = 45_000;

function subscriptionHref(
  areaId: string,
  dependenciaId: string | null
): string {
  if (dependenciaId != null && dependenciaId !== "") {
    return `/dependencias/${dependenciaId}/suscripcion`;
  }
  return getDashboardHref(areaId, "/suscripcion");
}

function isPaidActive(sub: Subscription | null | undefined): boolean {
  if (sub == null) return false;
  return sub.status === "active" || sub.status === "trialing";
}

export function BillingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const ctx = useSyncExternalStore(
    subscribeCheckoutReturnNoop,
    getCheckoutReturnClientSnapshot,
    getCheckoutReturnServerSnapshot
  );
  const [timedOut, setTimedOut] = useState(false);
  const pollStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!ctx.areaId) return;
    const t = window.setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => window.clearTimeout(t);
  }, [ctx.areaId]);

  const query = useQuery({
    queryKey: ["subscriptions", "current", ctx.areaId ?? "none"],
    queryFn: async () => {
      const res = await getCurrentSubscription(ctx.areaId!);
      return res.data;
    },
    enabled: Boolean(ctx.areaId),
    refetchInterval: (q) => {
      if (!ctx.areaId) return false;
      if (q.state.status === "error") return false;
      if (pollStartRef.current === null) {
        pollStartRef.current = Date.now();
      }
      if (Date.now() - pollStartRef.current > MAX_WAIT_MS) return false;
      const sub = q.state.data;
      if (isPaidActive(sub ?? null)) return false;
      return POLL_MS;
    },
  });

  useEffect(() => {
    if (!ctx.areaId) return;
    const sub = query.data;
    if (!isPaidActive(sub ?? null)) return;
    clearCheckoutReturnStorage();
    router.replace(subscriptionHref(ctx.areaId, ctx.dependenciaId));
  }, [ctx.areaId, ctx.dependenciaId, query.data, router]);

  if (!ctx.areaId) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          No pudimos recuperar el contexto del pago
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Si completaste el pago, la suscripción puede activarse en unos segundos.
          Elige tu organización y revisa la sección de suscripción.
        </p>
        <Link
          href="/select-organization"
          className="mt-6 inline-flex rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep)"
        >
          Ir a seleccionar organización
        </Link>
      </div>
    );
  }

  const sub = query.data;
  const isForbidden =
    query.isError &&
    query.error instanceof ApiError &&
    query.error.statusCode === 403;
  const showTimeout =
    timedOut && !isPaidActive(sub ?? null) && !query.isLoading;

  if (isForbidden) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Sin permiso para ver la suscripción
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Inicia sesión con una cuenta administradora del área o vuelve al
          panel.
        </p>
        <Link
          href="/select-organization"
          className="mt-6 inline-flex rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          Seleccionar organización
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <Loader2
        className="mx-auto size-10 animate-spin text-(--cyan-accent)"
        aria-hidden
      />
      <h1 className="mt-6 text-lg font-semibold text-slate-800 dark:text-slate-100">
        Confirmando tu suscripción
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Estamos sincronizando el pago con tu cuenta. Esto suele tardar unos
        segundos.
      </p>
      {sessionId ? (
        <p className="mt-4 font-mono text-xs text-slate-500 dark:text-slate-500">
          Referencia: {sessionId.slice(0, 24)}…
        </p>
      ) : null}
      {query.isError && !isForbidden ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          Hubo un error al consultar la suscripción. Puedes reintentar desde tu
          panel.
        </p>
      ) : null}
      {showTimeout ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Aún no vemos la suscripción activa. Si ya pagaste, espera un momento
            o revisa en tu panel; el webhook puede tardar un poco más.
          </p>
          <Link
            href={subscriptionHref(ctx.areaId, ctx.dependenciaId)}
            className="inline-flex rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep)"
          >
            Ir a suscripción
          </Link>
        </div>
      ) : null}
    </div>
  );
}
