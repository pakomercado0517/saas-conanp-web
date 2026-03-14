"use client";

import Link from "next/link";
import { CreditCard, Loader2 } from "lucide-react";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import type { Subscription, SubscriptionStatus } from "@/features/subscriptions/types";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Activo",
  trialing: "Período de prueba",
  canceled: "Cancelada",
  past_due: "Pago vencido",
  unpaid: "Pago pendiente",
  incomplete: "Incompleta",
  incomplete_expired: "Expirada",
};

function formatPeriodEnd(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface SubscriptionSummaryCardProps {
  areaId: string;
  subscriptionStatus: "loading" | "forbidden" | "ready";
  subscription: Subscription | null;
}

export function SubscriptionSummaryCard({
  areaId,
  subscriptionStatus,
  subscription,
}: SubscriptionSummaryCardProps) {
  if (subscriptionStatus === "forbidden") {
    return null;
  }

  const manageHref = getDashboardHref(areaId, "/suscripcion");

  if (subscriptionStatus === "loading") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
            <CreditCard className="size-5 text-slate-400" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="text-sm text-slate-500">Cargando suscripción…</p>
            <div className="mt-1 flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-slate-400" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isActive = subscription != null && (subscription.status === "active" || subscription.status === "trialing");
  const planName = subscription?.SubscriptionPlan?.name ?? "—";
  const statusLabel = subscription ? STATUS_LABELS[subscription.status] : "Sin suscripción activa";
  const periodEnd = subscription?.currentPeriodEnd ? formatPeriodEnd(subscription.currentPeriodEnd) : null;

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${
        isActive
          ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">Estado de suscripción</span>
        <span className="rounded-lg bg-(--primary)/10 p-2">
          <CreditCard className="size-5 text-(--primary)" aria-hidden />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold">{statusLabel}</p>
        {subscription && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">Plan: {planName}</p>
            {periodEnd && (
              <p className="text-xs text-slate-500">Vence: {periodEnd}</p>
            )}
          </>
        )}
        <Link
          href={manageHref}
          className="mt-3 inline-flex items-center text-sm font-semibold text-(--primary) hover:underline"
        >
          Gestionar suscripción
        </Link>
      </div>
    </div>
  );
}
