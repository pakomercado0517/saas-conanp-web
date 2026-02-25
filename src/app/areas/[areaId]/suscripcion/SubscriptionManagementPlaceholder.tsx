"use client";

import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { CreditCard, CheckCircle } from "lucide-react";

export function SubscriptionManagementPlaceholder() {
  const { subscription, role, isLoading } = useAreaContext();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="text-sm text-slate-500">Cargando suscripción…</p>
      </div>
    );
  }

  const isAdmin = role === "admin";
  const hasActiveSubscription =
    subscription &&
    (subscription.status === "active" || subscription.status === "trialing");
  const planName = subscription?.SubscriptionPlan?.name ?? "—";

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Suscripción
      </h1>

      {!isAdmin ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Solo los administradores del área pueden ver y gestionar la suscripción.
          </p>
        </div>
      ) : hasActiveSubscription ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                Plan actual: {planName}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Estado: {subscription?.status === "trialing" ? "Período de prueba" : "Activo"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            La gestión completa de planes (cambiar, cancelar, facturas) se implementará en la siguiente fase.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
              <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                Sin suscripción activa
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Contrata un plan para desbloquear el acceso completo al dashboard.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Por el momento el único plan disponible es <strong>FREE</strong>. La integración con Stripe para contratar planes de pago se implementará en la siguiente fase.
          </p>
        </div>
      )}
    </div>
  );
}
