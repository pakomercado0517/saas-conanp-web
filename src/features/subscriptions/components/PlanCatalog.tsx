"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";
import { useOrganizationSubscriptionMutations } from "../hooks/useOrganizationSubscriptionMutations";
import { getPlanLimitLabels } from "../lib/planLimits";
import { PENDING_PLAN_ID_STORAGE_KEY, type SubscriptionPlan } from "../types";
import { PlanSelectorDialog } from "./PlanSelectorDialog";

function formatPlanPrice(plan: SubscriptionPlan): string | null {
  const monthly = plan.priceMonthly;
  if (typeof monthly === "number" && monthly > 0) {
    return `$${monthly.toLocaleString("es-MX")}/mes`;
  }
  if (typeof monthly === "number" && monthly === 0) return "Gratis";
  if (monthly == null) return "Personalizado";
  return null;
}

function isFreePlanName(name: string): boolean {
  return name.trim().toLowerCase() === "free";
}

interface PlanCatalogProps {
  areaId: string;
  /** Si el catálogo se muestra en contexto de dependencia (retorno tras Checkout). */
  dependenciaId?: string | null;
}

export function PlanCatalog({
  areaId,
  dependenciaId = null,
}: PlanCatalogProps) {
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [initialPlanId, setInitialPlanId] = useState<string | undefined>();

  const { plans, isLoading, isError } = useSubscriptionPlans();
  const { isPending } = useOrganizationSubscriptionMutations(areaId);

  const availablePlans = plans.filter((p) => p.active !== false);
  const paidPlans = availablePlans.filter((p) => !isFreePlanName(p.name));
  const hasAppliedPendingPlan = useRef(false);

  useEffect(() => {
    if (isLoading || isError || availablePlans.length === 0 || hasAppliedPendingPlan.current)
      return;
    try {
      const pending = sessionStorage.getItem(PENDING_PLAN_ID_STORAGE_KEY);
      sessionStorage.removeItem(PENDING_PLAN_ID_STORAGE_KEY);
      if (!pending?.trim()) return;
      const match = availablePlans.find((p) => p.id === pending.trim());
      if (match && !isFreePlanName(match.name)) {
        hasAppliedPendingPlan.current = true;
        const planId = pending.trim();
        queueMicrotask(() => {
          setInitialPlanId(planId);
          setShowSubscribeDialog(true);
        });
      }
    } catch {
      // ignore
    }
  }, [isLoading, isError, availablePlans]);

  if (isLoading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 p-8 dark:border-slate-700 dark:bg-slate-800/30">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Cargando planes…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-6 dark:border-red-800 dark:bg-red-950/30">
        <p className="text-sm text-red-700 dark:text-red-300">
          No se pudieron cargar los planes. Intenta de nuevo más tarde.
        </p>
      </div>
    );
  }

  if (availablePlans.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          No hay planes disponibles en este momento. Contacta al administrador del
          sistema.
        </p>
      </div>
    );
  }

  if (paidPlans.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          No hay planes de pago configurados para contratar en este momento.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Planes disponibles
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {paidPlans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--cyan-accent)/20">
                  <CreditCard
                    className="h-5 w-5 text-(--cyan-accent)"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold uppercase text-slate-800 dark:text-slate-100">
                    {plan.name}
                  </p>
                  {plan.description && (
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                  {(() => {
                    const price = formatPlanPrice(plan);
                    const labels = getPlanLimitLabels(plan);
                    if (!price && labels.length === 0) return null;
                    return (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {[price, labels.length > 0 ? labels.join(" · ") : null]
                          .filter(Boolean)
                          .join(" — ")}
                      </p>
                    );
                  })()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInitialPlanId(plan.id);
                  setShowSubscribeDialog(true);
                }}
                disabled={isPending}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--cyan-accent) py-2.5 text-sm font-semibold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70"
              >
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                Contratar plan
              </button>
            </div>
          ))}
        </div>
      </div>

      <PlanSelectorDialog
        open={showSubscribeDialog}
        onClose={() => {
          setShowSubscribeDialog(false);
          setInitialPlanId(undefined);
        }}
        areaId={areaId}
        dependenciaId={dependenciaId}
        initialPlanId={initialPlanId}
        mode="subscribe"
      />
    </>
  );
}
