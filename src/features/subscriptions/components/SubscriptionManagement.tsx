"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { CurrentSubscriptionCard } from "./CurrentSubscriptionCard";
import { PlanCatalog } from "./PlanCatalog";

export function SubscriptionManagement() {
  const { subscription, role, isLoading, areaId } = useAreaContext();

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
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Suscripción
        </h1>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Solo los administradores del área pueden ver y gestionar la
            suscripción.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Suscripción
      </h1>

      {subscription ? (
        <CurrentSubscriptionCard
          subscription={subscription}
          areaId={areaId}
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
          <PlanCatalog areaId={areaId} />
        </div>
      )}
    </div>
  );
}
