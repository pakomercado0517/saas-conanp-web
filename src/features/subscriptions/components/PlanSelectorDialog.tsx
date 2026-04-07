"use client";

import { useState } from "react";
import { X, Loader2, CreditCard } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";
import { useOrganizationSubscriptionMutations } from "../hooks/useOrganizationSubscriptionMutations";
import { getPlanLimitLabels } from "../lib/planLimits";
import { persistCheckoutReturnContext } from "../lib/checkoutReturnStorage";
import { subscriptionAllowsPatchPlanChange } from "../lib/subscriptionPayment";
import type { BillingCycle, Subscription, SubscriptionPlan } from "../types";

function formatPlanPriceForCycle(plan: SubscriptionPlan, cycle: BillingCycle): string | null {
  const amount = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
  if (typeof amount === "number" && amount > 0) {
    return `$${amount.toLocaleString("es-MX")}${cycle === "yearly" ? "/año" : "/mes"}`;
  }
  if (typeof amount === "number" && amount === 0) return "Gratis";
  if (amount == null) return "Personalizado";
  return null;
}

function isFreePlanName(name: string): boolean {
  return name.trim().toLowerCase() === "free";
}

const BILLING_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
];

interface PlanSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  areaId: string;
  /** Para volver a `/dependencias/.../suscripcion` tras Stripe Checkout. */
  dependenciaId?: string | null;
  currentPlanId?: string;
  initialPlanId?: string;
  mode: "subscribe" | "change";
  /** En modo `change`, necesario para decidir checkout (FREE→pago) vs PATCH (plan con Stripe). */
  subscription?: Subscription | null;
  /** Incluir en `key` del contenido para alinear ciclo con la comparativa exterior. */
  billingCycleKey?: BillingCycle;
}

/** Contenido del diálogo con estado propio; key en el padre fuerza remount al cambiar initialPlanId. */
function PlanSelectorDialogContent({
  onClose,
  areaId,
  dependenciaId = null,
  currentPlanId,
  initialPlanId,
  mode,
  subscription,
  initialBillingCycle = "monthly",
}: Omit<PlanSelectorDialogProps, "open" | "billingCycleKey"> & {
  initialBillingCycle?: BillingCycle;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialPlanId ?? null
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialBillingCycle);
  const [error, setError] = useState<string | null>(null);

  const displaySelectedPlanId = selectedPlanId ?? initialPlanId ?? null;

  const { plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { startCheckout, changePlan, isPending: isSubscribing } =
    useOrganizationSubscriptionMutations(areaId);

  const availablePlans = plans.filter((p) => p.active !== false);
  const paidPlans = availablePlans.filter((p) => !isFreePlanName(p.name));
  const plansToShow =
    mode === "change"
      ? paidPlans.filter((p) => p.id !== currentPlanId)
      : paidPlans;

  const handleSubmit = async () => {
    const planIdToUse = displaySelectedPlanId;
    if (!planIdToUse) return;
    setError(null);
    try {
      if (
        mode === "change" &&
        subscription &&
        subscriptionAllowsPatchPlanChange(subscription)
      ) {
        await changePlan({
          subscriptionId: subscription.id,
          payload: {
            planId: planIdToUse,
            billingCycle,
            prorate: true,
          },
        });
        onClose();
        return;
      }
      persistCheckoutReturnContext(areaId, dependenciaId);
      const res = await startCheckout({
        planId: planIdToUse,
        billingCycle,
      });
      if (res.data?.url) {
        window.location.assign(res.data.url);
        return;
      }
      setError("No se recibió la URL de pago. Intenta de nuevo.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {mode === "subscribe" ? "Contratar plan" : "Cambiar plan"}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {mode === "subscribe"
            ? "Elige un plan; continuarás al pago seguro en Stripe."
            : subscription && subscriptionAllowsPatchPlanChange(subscription)
              ? "Elige el plan al que deseas cambiar."
              : "Elige un plan; continuarás al pago seguro en Stripe."}
        </p>

        {error && (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Ciclo de facturación
          </label>
          <div className="flex gap-2">
            {BILLING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBillingCycle(opt.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === opt.value
                    ? "bg-(--cyan-accent) text-(--navy-deep) dark:bg-(--cyan-accent) dark:text-(--navy-deep)"
                    : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {plansLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Cargando planes…
            </p>
          ) : plansToShow.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              {mode === "change"
                ? "No hay otros planes de pago disponibles."
                : "No hay planes de pago disponibles en este momento."}
            </p>
          ) : (
            plansToShow.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                  displaySelectedPlanId === plan.id
                    ? "border-(--cyan-accent) bg-(--cyan-accent)/10 dark:border-(--cyan-accent) dark:bg-(--cyan-accent)/10"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--cyan-accent)/20">
                    <CreditCard
                      className="h-5 w-5 text-(--cyan-accent)"
                      aria-hidden
                    />
                  </div>
                  <div>
                    <p className="font-semibold uppercase text-slate-800 dark:text-slate-100">
                      {plan.name}
                    </p>
                    {plan.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        {plan.description}
                      </p>
                    )}
                    {(() => {
                      const price = formatPlanPriceForCycle(plan, billingCycle);
                      const labels = getPlanLimitLabels(plan);
                      if (!price && labels.length === 0) return null;
                      return (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {[price, labels.length > 0 ? labels.join(" · ") : null]
                            .filter(Boolean)
                            .join(" — ")}
                        </p>
                      );
                    })()}
                  </div>
                </div>
                {displaySelectedPlanId === plan.id && (
                  <span className="text-sm font-medium text-(--cyan-accent)">
                    Seleccionado
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!displaySelectedPlanId || isSubscribing}
            className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70"
          >
            {isSubscribing && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            {mode === "change" && subscription && subscriptionAllowsPatchPlanChange(subscription)
              ? "Cambiar"
              : "Continuar al pago"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlanSelectorDialog(props: PlanSelectorDialogProps) {
  const {
    open,
    onClose,
    areaId,
    dependenciaId,
    currentPlanId,
    initialPlanId,
    mode,
    subscription,
    billingCycleKey,
  } = props;

  if (!open) return null;

  return (
    <PlanSelectorDialogContent
      key={`${initialPlanId ?? "none"}-${billingCycleKey ?? "default"}`}
      onClose={onClose}
      areaId={areaId}
      dependenciaId={dependenciaId}
      currentPlanId={currentPlanId}
      initialPlanId={initialPlanId}
      mode={mode}
      subscription={subscription}
      initialBillingCycle={billingCycleKey ?? "monthly"}
    />
  );
}
