"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";
import { useSubscribeOrChangePlan } from "../hooks/useSubscribeOrChangePlan";
import { PlanSelectorDialog } from "./PlanSelectorDialog";

interface PlanCatalogProps {
  areaId: string;
}

export function PlanCatalog({ areaId }: PlanCatalogProps) {
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [initialPlanId, setInitialPlanId] = useState<string | undefined>();

  const { plans, isLoading, isError } = useSubscriptionPlans();
  const { isPending } = useSubscribeOrChangePlan(areaId);

  const availablePlans = plans.filter((p) => p.active !== false);

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

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Planes disponibles
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {availablePlans.map((plan) => (
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
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {plan.name}
                  </p>
                  {(plan.maxUsers != null ||
                    plan.maxEventos != null ||
                    plan.maxActividades != null) && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {[
                        plan.maxUsers != null && `${plan.maxUsers} usuarios`,
                        plan.maxEventos != null && `${plan.maxEventos} eventos`,
                        plan.maxActividades != null &&
                          `${plan.maxActividades} actividades`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
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
        initialPlanId={initialPlanId}
        mode="subscribe"
      />
    </>
  );
}
