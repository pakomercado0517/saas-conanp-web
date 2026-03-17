"use client";

import { useState } from "react";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  RefreshCw,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import type { Subscription, SubscriptionStatus, BillingCycle } from "../types";
import { useCancelSubscription } from "../hooks/useCancelSubscription";
import { useReactivateSubscription } from "../hooks/useReactivateSubscription";
import { CancelConfirmDialog } from "./CancelConfirmDialog";
import { ReactivateConfirmDialog } from "./ReactivateConfirmDialog";
import { PlanSelectorDialog } from "./PlanSelectorDialog";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Activo",
  trialing: "Período de prueba",
  canceled: "Cancelada",
  past_due: "Pago vencido",
  unpaid: "Pago pendiente",
  incomplete: "Incompleta",
  incomplete_expired: "Expirada",
};

const BILLING_LABELS: Record<BillingCycle, string> = {
  monthly: "Mensual",
  yearly: "Anual",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface CurrentSubscriptionCardProps {
  subscription: Subscription;
  areaId: string;
}

export function CurrentSubscriptionCard({
  subscription,
  areaId,
}: CurrentSubscriptionCardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);

  const {
    cancel,
    isPending: isCanceling,
    error: cancelError,
  } = useCancelSubscription(areaId);
  const {
    reactivate,
    isPending: isReactivating,
    error: reactivateError,
  } = useReactivateSubscription(areaId);

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";
  const isCanceledAtPeriodEnd =
    subscription.cancelAtPeriodEnd && subscription.status !== "canceled";
  const needsPayment =
    subscription.status === "past_due" ||
    subscription.status === "unpaid" ||
    subscription.status === "incomplete" ||
    subscription.status === "incomplete_expired";

  const planName = subscription.SubscriptionPlan?.name ?? "—";

  const handleCancel = async () => {
    await cancel();
    setShowCancelDialog(false);
  };

  const handleReactivate = async () => {
    await reactivate();
    setShowReactivateDialog(false);
  };

  return (
    <>
      <div
        className={`rounded-xl border p-6 ${
          isActive && !isCanceledAtPeriodEnd
            ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30"
            : isCanceledAtPeriodEnd
              ? "border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30"
              : needsPayment
                ? "border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-950/30"
                : "border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isActive && !isCanceledAtPeriodEnd
                ? "bg-emerald-100 dark:bg-emerald-900/50"
                : isCanceledAtPeriodEnd
                  ? "bg-amber-100 dark:bg-amber-900/50"
                  : needsPayment
                    ? "bg-red-100 dark:bg-red-900/50"
                    : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            {isActive && !isCanceledAtPeriodEnd ? (
              <CheckCircle
                className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
            ) : needsPayment ? (
              <AlertCircle
                className="h-6 w-6 text-red-600 dark:text-red-400"
                aria-hidden
              />
            ) : (
              <CreditCard
                className="h-6 w-6 text-slate-600 dark:text-slate-400"
                aria-hidden
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">
              Plan actual: <span className="uppercase">{planName}</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Estado: {STATUS_LABELS[subscription.status]}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Ciclo: {BILLING_LABELS[subscription.billingCycle]} · Periodo del{" "}
              {formatDate(subscription.currentPeriodStart)} al{" "}
              {formatDate(subscription.currentPeriodEnd)}
            </p>
            {isCanceledAtPeriodEnd && (
              <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                Se cancelará al final del periodo ({formatDate(subscription.currentPeriodEnd)})
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isActive && !isCanceledAtPeriodEnd && (
            <>
              <button
                type="button"
                onClick={() => setShowChangePlanDialog(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Cambiar plan
              </button>
              <button
                type="button"
                onClick={() => setShowCancelDialog(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
              >
                <XCircle className="h-4 w-4" aria-hidden />
                Cancelar al final del periodo
              </button>
            </>
          )}
          {isCanceledAtPeriodEnd && (
            <button
              type="button"
              onClick={() => setShowReactivateDialog(true)}
              disabled={isReactivating}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-70 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {isReactivating && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              )}
              <RefreshCw className="h-4 w-4" aria-hidden />
              Reactivar suscripción
            </button>
          )}
          {needsPayment && (
            <a
              href={`/areas/${areaId}/suscripcion`}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              <CreditCard className="h-4 w-4" aria-hidden />
              Actualizar plan
            </a>
          )}
        </div>
      </div>

      <CancelConfirmDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        isPending={isCanceling}
        periodEnd={subscription.currentPeriodEnd}
        error={cancelError ? getApiErrorMessage(cancelError) : null}
      />

      <ReactivateConfirmDialog
        open={showReactivateDialog}
        onClose={() => setShowReactivateDialog(false)}
        onConfirm={handleReactivate}
        isPending={isReactivating}
        error={reactivateError ? getApiErrorMessage(reactivateError) : null}
      />

      <PlanSelectorDialog
        open={showChangePlanDialog}
        onClose={() => setShowChangePlanDialog(false)}
        areaId={areaId}
        currentPlanId={subscription.planId}
        mode="change"
      />
    </>
  );
}
