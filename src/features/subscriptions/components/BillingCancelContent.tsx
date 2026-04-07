"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import {
  getCheckoutReturnClientSnapshot,
  getCheckoutReturnServerSnapshot,
  subscribeCheckoutReturnNoop,
} from "../lib/checkoutReturnStorage";

export function BillingCancelContent() {
  const ctx = useSyncExternalStore(
    subscribeCheckoutReturnNoop,
    getCheckoutReturnClientSnapshot,
    getCheckoutReturnServerSnapshot
  );

  const backHref =
    ctx.areaId != null
      ? ctx.dependenciaId != null && ctx.dependenciaId !== ""
        ? `/dependencias/${ctx.dependenciaId}/suscripcion`
        : getDashboardHref(ctx.areaId, "/suscripcion")
      : "/select-organization";

  const backLabel =
    ctx.areaId != null ? "Volver a suscripción" : "Seleccionar organización";

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Pago cancelado
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        No se completó el cobro en Stripe. Puedes elegir un plan de nuevo cuando
        quieras.
      </p>
      <Link
        href={backHref}
        className="mt-8 inline-flex rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep)"
      >
        {backLabel}
      </Link>
    </div>
  );
}
