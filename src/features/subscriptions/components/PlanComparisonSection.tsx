"use client";

import { Check, CreditCard, Loader2 } from "lucide-react";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";
import { getPlanLimitLabels } from "../lib/planLimits";
import { useRetrySubscriptionCheckout } from "../hooks/useRetrySubscriptionCheckout";
import { subscriptionNeedsPaymentCompletion } from "../lib/subscriptionPayment";
import type { BillingCycle, Subscription, SubscriptionPlan } from "../types";

function isFreePlanName(name: string): boolean {
  return name.trim().toLowerCase() === "free";
}

function formatPriceForCycle(
  plan: SubscriptionPlan,
  cycle: BillingCycle
): string | null {
  const amount = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
  if (typeof amount === "number" && amount > 0) {
    return `$${amount.toLocaleString("es-MX")}${cycle === "yearly" ? "/año" : "/mes"}`;
  }
  if (typeof amount === "number" && amount === 0) return "Gratis";
  if (amount == null) return "Personalizado";
  return null;
}

interface PlanComparisonSectionProps {
  areaId: string;
  dependenciaId?: string | null;
  subscription: Subscription | null;
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  onSelectPlan: (planId: string) => void;
  isActionPending: boolean;
}

export function PlanComparisonSection({
  areaId,
  dependenciaId = null,
  subscription,
  billingCycle,
  onBillingCycleChange,
  onSelectPlan,
  isActionPending,
}: PlanComparisonSectionProps) {
  const { plans, isLoading, isError } = useSubscriptionPlans();
  const { retry: retryCheckout, isPending: isRetryCheckout } =
    useRetrySubscriptionCheckout(areaId);
  const available = plans.filter((p) => p.active !== false);

  const cycleLabel =
    billingCycle === "yearly"
      ? "Los precios anuales suelen incluir descuento frente al pago mensual."
      : "Puedes cambiar a facturación anual cuando contrates o cambies de plan.";

  if (isLoading) {
    return (
      <div className="flex min-h-[24vh] items-center justify-center rounded-2xl bg-white/80 p-10 shadow-sm dark:bg-slate-900/40">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Cargando planes…
        </p>
      </div>
    );
  }

  if (isError || available.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-6 py-8 text-center text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        No se pudieron cargar los planes. Intenta de nuevo más tarde.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-(--navy-deep) dark:text-white">
            Comparar planes
          </h2>
          <p className="mt-1 text-sm text-(--slate-text)">{cycleLabel}</p>
        </div>
        <div
          className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-600 dark:bg-slate-800"
          role="group"
          aria-label="Ciclo de facturación"
        >
          {(
            [
              { value: "monthly" as const, label: "Mensual" },
              { value: "yearly" as const, label: "Anual" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onBillingCycleChange(opt.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                billingCycle === opt.value
                  ? "bg-(--cyan-accent) text-(--navy-deep) shadow-sm"
                  : "text-(--slate-text) hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {available.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          const price = formatPriceForCycle(plan, billingCycle);
          const labels = getPlanLimitLabels(plan);
          const freeName = isFreePlanName(plan.name);
          const needsCompletePayment =
            isCurrent &&
            subscription != null &&
            subscriptionNeedsPaymentCompletion(subscription) &&
            !freeName;

          let ctaLabel = "Contratar";
          let ctaDisabled = isActionPending;
          if (needsCompletePayment && subscription) {
            const incompleteCheckout =
              subscription.status === "incomplete" ||
              subscription.status === "incomplete_expired";
            ctaLabel = incompleteCheckout
              ? "Generar nuevo checkout"
              : "Completar pago";
            ctaDisabled = isActionPending || isRetryCheckout;
          } else if (isCurrent) {
            ctaLabel = "Plan actual";
            ctaDisabled = true;
          } else if (freeName) {
            ctaLabel = "Incluido";
            ctaDisabled = true;
          } else if (subscription) {
            ctaLabel = "Cambiar a este plan";
          }

          const showButtonSpinner =
            (needsCompletePayment && isRetryCheckout) ||
            (isActionPending && !needsCompletePayment);

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow dark:bg-slate-900/80 ${
                isCurrent
                  ? "border-(--cyan-accent) ring-2 ring-(--cyan-accent)/40 dark:border-(--cyan-accent)"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {isCurrent ? (
                <span className="absolute -top-3 left-4 rounded-full bg-(--cyan-accent) px-3 py-0.5 text-xs font-bold text-(--navy-deep)">
                  Plan actual
                </span>
              ) : null}
              <div className="mb-4 flex items-start gap-2">
                <span className="rounded-lg bg-(--cyan-accent)/15 p-2 dark:bg-(--cyan-accent)/20">
                  <CreditCard
                    className="size-5 text-(--cyan-accent)"
                    aria-hidden
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold uppercase tracking-wide text-(--navy-deep) dark:text-white">
                    {plan.name}
                  </h3>
                  {plan.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-(--slate-text)">
                      {plan.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="mb-4 text-2xl font-extrabold text-(--navy-deep) dark:text-white">
                {price ?? "—"}
              </p>
              <ul className="mb-6 flex-1 space-y-2 text-xs text-(--slate-text)">
                {labels.slice(0, 5).map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check
                      className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={ctaDisabled}
                onClick={() => {
                  if (needsCompletePayment && subscription) {
                    void retryCheckout({
                      planId: subscription.planId,
                      billingCycle: subscription.billingCycle,
                      dependenciaId,
                    });
                    return;
                  }
                  onSelectPlan(plan.id);
                }}
                className="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-(--navy-deep) py-3 text-sm font-bold text-white transition-colors hover:bg-(--navy-deep)/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-(--cyan-accent) dark:text-(--navy-deep) dark:hover:bg-(--cyan-hover)"
              >
                {showButtonSpinner ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  ctaLabel
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-(--slate-text)">
        Los pagos se procesan de forma segura con Stripe. El historial de facturas
        estará disponible desde esta misma sección en una próxima versión.
      </p>
    </section>
  );
}
