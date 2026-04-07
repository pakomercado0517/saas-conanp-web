"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, CreditCard, Loader2 } from "lucide-react";
import type { MembershipRole } from "@/features/memberships/types";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";
import { useOrganizationSubscriptionMutations } from "../hooks/useOrganizationSubscriptionMutations";
import type { BillingCycle, Subscription } from "../types";
import { PENDING_PLAN_ID_STORAGE_KEY } from "../types";
import { CurrentSubscriptionCard } from "./CurrentSubscriptionCard";
import { PlanComparisonSection } from "./PlanComparisonSection";
import { PlanSelectorDialog } from "./PlanSelectorDialog";

export type SubscriptionManagementPanelVariant = "default" | "dependencia";

export interface SubscriptionManagementPanelProps {
  areaId: string;
  subscription: Subscription | null;
  role: MembershipRole | null;
  isLoading: boolean;
  variant?: SubscriptionManagementPanelVariant;
  /** Para enlaces y cabecera en contexto de dependencia. */
  dependenciaId?: string | null;
  dependenciaName?: string | null;
}

export function SubscriptionManagementPanel({
  areaId,
  subscription,
  role,
  isLoading,
  variant = "default",
  dependenciaId = null,
  dependenciaName = null,
}: SubscriptionManagementPanelProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"subscribe" | "change">(
    "subscribe"
  );
  const [initialPlanId, setInitialPlanId] = useState<string | undefined>();

  const { plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { isPending } = useOrganizationSubscriptionMutations(areaId);

  const availablePlans = plans.filter((p) => p.active !== false);
  const hasAppliedPendingPlan = useRef(false);

  useEffect(() => {
    if (role !== "admin") return;
    if (
      plansLoading ||
      availablePlans.length === 0 ||
      hasAppliedPendingPlan.current
    ) {
      return;
    }
    try {
      const pending = sessionStorage.getItem(PENDING_PLAN_ID_STORAGE_KEY);
      sessionStorage.removeItem(PENDING_PLAN_ID_STORAGE_KEY);
      if (!pending?.trim()) return;
      const match = availablePlans.find((p) => p.id === pending.trim());
      const name = match?.name?.trim().toLowerCase() ?? "";
      if (match && name !== "free") {
        hasAppliedPendingPlan.current = true;
        const planId = pending.trim();
        queueMicrotask(() => {
          setInitialPlanId(planId);
          setDialogMode(subscription ? "change" : "subscribe");
          setPlanDialogOpen(true);
        });
      }
    } catch {
      // ignore
    }
  }, [plansLoading, availablePlans, subscription, role]);

  const handleSelectPlan = (planId: string) => {
    setInitialPlanId(planId);
    setDialogMode(subscription ? "change" : "subscribe");
    setPlanDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Cargando suscripción…
        </p>
      </div>
    );
  }

  const isAdmin = role === "admin";

  if (!isAdmin) {
    const nonAdminMessage =
      variant === "dependencia"
        ? "Solo los administradores de al menos un área natural protegida de esta dependencia pueden ver y gestionar la suscripción."
        : "Solo los administradores del área pueden ver y gestionar la suscripción.";

    return (
      <div
        className={
          variant === "dependencia"
            ? "mx-auto max-w-6xl space-y-8 p-6"
            : "mx-auto max-w-2xl space-y-8 p-6"
        }
      >
        {variant === "dependencia" && dependenciaId ? (
          <nav
            className="flex flex-wrap items-center gap-1 text-sm text-(--slate-text)"
            aria-label="Ruta de navegación"
          >
            <Link
              href={`/dependencias/${dependenciaId}`}
              className="font-medium transition-colors hover:text-(--cyan-accent)"
            >
              {dependenciaName ?? "Dependencia"}
            </Link>
            <ChevronRight className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="text-(--navy-deep) dark:text-white">
              Suscripción
            </span>
          </nav>
        ) : null}
        {variant === "default" ? (
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Suscripción
          </h1>
        ) : null}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {nonAdminMessage}
          </p>
        </div>
      </div>
    );
  }

  const shellClass =
    variant === "dependencia"
      ? "mx-auto max-w-6xl space-y-10 p-6"
      : "mx-auto max-w-2xl space-y-8 p-6";

  return (
    <div className={shellClass}>
      {variant === "dependencia" && dependenciaId ? (
        <nav
          className="flex flex-wrap items-center gap-1 text-sm text-(--slate-text)"
          aria-label="Ruta de navegación"
        >
          <Link
            href={`/dependencias/${dependenciaId}`}
            className="font-medium transition-colors hover:text-(--cyan-accent)"
          >
            {dependenciaName ?? "Dependencia"}
          </Link>
          <ChevronRight className="size-4 shrink-0 opacity-70" aria-hidden />
          <span className="text-(--navy-deep) dark:text-white">Suscripción</span>
        </nav>
      ) : null}

      {variant === "default" ? (
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Suscripción
        </h1>
      ) : null}

      {subscription ? (
        <CurrentSubscriptionCard
          subscription={subscription}
          areaId={areaId}
          dependenciaId={dependenciaId}
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                <CreditCard
                  className="h-6 w-6 text-amber-600 dark:text-amber-400"
                  aria-hidden
                />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  Sin suscripción activa
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Contrata un plan para desbloquear el acceso completo al
                  dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <PlanComparisonSection
        areaId={areaId}
        dependenciaId={dependenciaId}
        subscription={subscription}
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
        onSelectPlan={handleSelectPlan}
        isActionPending={isPending}
      />

      <PlanSelectorDialog
        open={planDialogOpen}
        onClose={() => {
          setPlanDialogOpen(false);
          setInitialPlanId(undefined);
        }}
        areaId={areaId}
        dependenciaId={dependenciaId}
        currentPlanId={subscription?.planId}
        initialPlanId={initialPlanId}
        mode={dialogMode}
        subscription={subscription ?? undefined}
        billingCycleKey={billingCycle}
      />
    </div>
  );
}
