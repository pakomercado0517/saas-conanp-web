"use client";

import { useState } from "react";
import { X, Loader2, CreditCard } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";
import { useSubscribeOrChangePlan } from "../hooks/useSubscribeOrChangePlan";
import type { BillingCycle } from "../types";

const BILLING_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
];

interface PlanSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  areaId: string;
  currentPlanId?: string;
  initialPlanId?: string;
  mode: "subscribe" | "change";
}

/** Contenido del diálogo con estado propio; key en el padre fuerza remount al cambiar initialPlanId. */
function PlanSelectorDialogContent({
  onClose,
  areaId,
  currentPlanId,
  initialPlanId,
  mode,
}: Omit<PlanSelectorDialogProps, "open">) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialPlanId ?? null
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [error, setError] = useState<string | null>(null);

  const displaySelectedPlanId = selectedPlanId ?? initialPlanId ?? null;

  const { plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { subscribe, isPending: isSubscribing } =
    useSubscribeOrChangePlan(areaId);

  const availablePlans = plans.filter((p) => p.active !== false);
  const plansToShow =
    mode === "change"
      ? availablePlans.filter((p) => p.id !== currentPlanId)
      : availablePlans;

  const handleSubmit = async () => {
    const planIdToUse = displaySelectedPlanId;
    if (!planIdToUse) return;
    setError(null);
    try {
      const res = await subscribe({ planId: planIdToUse, billingCycle });
      if ("data" in res && "checkoutUrl" in res.data) {
        window.location.href = res.data.checkoutUrl;
        return;
      }
      onClose();
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
            ? "Elige un plan para activar la suscripción del área."
            : "Elige el plan al que deseas cambiar."}
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
                ? "No hay otros planes disponibles."
                : "No hay planes disponibles en este momento."}
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
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {plan.name}
                    </p>
                    {(plan.maxUsers != null ||
                      plan.maxEventos != null ||
                      plan.maxActividades != null) && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {[
                          plan.maxUsers != null && `${plan.maxUsers} usuarios`,
                          plan.maxEventos != null &&
                            `${plan.maxEventos} eventos`,
                          plan.maxActividades != null &&
                            `${plan.maxActividades} actividades`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
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
            {mode === "subscribe" ? "Contratar" : "Cambiar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlanSelectorDialog(props: PlanSelectorDialogProps) {
  const { open, onClose, areaId, currentPlanId, initialPlanId, mode } = props;

  if (!open) return null;

  return (
    <PlanSelectorDialogContent
      key={initialPlanId ?? "none"}
      onClose={onClose}
      areaId={areaId}
      currentPlanId={currentPlanId}
      initialPlanId={initialPlanId}
      mode={mode}
    />
  );
}
