"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscriptionPlans } from "@/features/subscriptions/hooks/useSubscriptionPlans";
import { getPlanLimitLabels } from "@/features/subscriptions/lib/planLimits";
import type { SubscriptionPlan } from "@/features/subscriptions/types";

function formatPrice(amount: number, suffix: string): string {
  return `$${amount.toLocaleString("es-MX")}${suffix}`;
}

function PlanDisplayPrice({
  plan,
  isAnnual,
}: {
  plan: SubscriptionPlan;
  isAnnual: boolean;
}) {
  const amount = isAnnual ? plan.priceYearly : plan.priceMonthly;
  const period = isAnnual ? "/año" : "/mes";
  const original = isAnnual ? plan.priceMonthly : null;
  return (
    <div className="mb-8">
      {amount == null ? (
        <span className="text-4xl font-bold">Personalizado</span>
      ) : amount === 0 ? (
        <span className="text-4xl font-bold">Gratis</span>
      ) : (
        <>
          <span className="text-4xl font-bold">
            {formatPrice(amount, period)}
          </span>
          {isAnnual && original != null && original > 0 && (
            <span className="ml-2 text-sm text-white/40 line-through">
              {formatPrice(original, "/mes")}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function PlanItem({
  icon: Icon,
  label,
  negative,
}: {
  icon: React.ElementType;
  label: string;
  negative?: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          negative ? "text-white/30" : "text-(--cyan-accent)"
        )}
        aria-hidden
      />
      <span className={negative ? "text-white/30" : undefined}>{label}</span>
    </li>
  );
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { plans, isLoading, isError } = useSubscriptionPlans();
  const availablePlans = plans.filter((p) => p.active !== false);

  return (
    <section className="bg-(--navy-deep) py-24 text-white" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold">Planes de Suscripción</h2>
          {!isLoading && !isError && availablePlans.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <span
                className={cn(
                  "text-sm font-medium",
                  !isAnnual ? "opacity-100" : "opacity-60"
                )}
              >
                Mensual
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isAnnual}
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative h-7 w-14 rounded-full bg-(--cyan-accent)/20 p-1 transition-colors"
              >
                <div
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full bg-(--cyan-accent) transition-all",
                    isAnnual ? "right-1" : "left-1"
                  )}
                />
              </button>
              <span
                className={cn(
                  "text-sm font-medium",
                  isAnnual ? "opacity-100" : "opacity-60"
                )}
              >
                Anual
              </span>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex min-h-[320px] items-center justify-center">
            <p className="flex items-center gap-2 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Cargando planes…
            </p>
          </div>
        )}

        {isError && (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-white/70">
              No se pudieron cargar los planes. Intenta más tarde.
            </p>
          </div>
        )}

        {!isLoading && !isError && availablePlans.length === 0 && (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
            <p className="text-sm text-white/70">
              No hay planes disponibles en este momento.
            </p>
            <Link
              href="/auth/register"
              className="rounded bg-(--cyan-accent) px-6 py-3 font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
            >
              Registrarse
            </Link>
          </div>
        )}

        {!isLoading && !isError && availablePlans.length > 0 && (
          <div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            style={{
              gridTemplateColumns:
                availablePlans.length >= 3
                  ? undefined
                  : `repeat(${availablePlans.length}, minmax(0, 1fr))`,
            }}
          >
            {availablePlans.map((plan, index) => {
              const isRecommended = availablePlans.length >= 2 && index === 1;
              const isContact =
                plan.priceMonthly == null ||
                (typeof plan.priceMonthly === "number" &&
                  plan.priceMonthly === 0 &&
                  plan.name?.toLowerCase() === "enterprise");
              const limits = getPlanLimitLabels(plan);
              const functionalities = plan.features?.functionalities ?? [];

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl border bg-(--navy-light) p-8 transition-all",
                    isRecommended
                      ? "scale-105 border-2 border-(--cyan-accent) shadow-2xl"
                      : "border-white/5 hover:border-(--cyan-accent)/20"
                  )}
                >
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-(--cyan-accent) px-4 py-1 text-xs font-bold uppercase tracking-widest text-(--navy-deep)">
                      Recomendado
                    </div>
                  )}
                  <h3
                    className={cn(
                      "mb-2 text-xl font-bold uppercase",
                      isRecommended ? "text-(--cyan-accent)" : undefined
                    )}
                  >
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="mb-6 text-sm text-white/60 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                  {!plan.description && <div className="mb-6" />}
                  <PlanDisplayPrice plan={plan} isAnnual={isAnnual} />
                  <ul className="mb-8 space-y-4 text-sm opacity-80">
                    {limits.slice(0, 4).map((label) => (
                      <PlanItem key={label} icon={CheckCircle2} label={label} />
                    ))}
                    {functionalities.length > 0 &&
                      functionalities.slice(0, 3).map((f) => (
                        <PlanItem
                          key={f}
                          icon={CheckCircle2}
                          label={f.replace(/_/g, " ")}
                        />
                      ))}
                    {limits.length === 0 && functionalities.length === 0 && (
                      <PlanItem icon={CheckCircle2} label="Gestión básica" />
                    )}
                  </ul>
                  {isContact ? (
                    <Link
                      href="mailto:ventas@conanp.gob.mx"
                      className="flex w-full items-center justify-center rounded border border-white/20 py-3 font-semibold text-white transition-colors hover:bg-white/5"
                    >
                      Hablar con Ventas
                    </Link>
                  ) : (
                    <Link
                      href={`/auth/register?planId=${encodeURIComponent(plan.id)}`}
                      className={cn(
                        "flex w-full items-center justify-center rounded py-3 font-bold transition-colors",
                        isRecommended
                          ? "bg-(--cyan-accent) text-(--navy-deep) hover:bg-(--cyan-hover)"
                          : "border border-(--cyan-accent)/30 text-(--cyan-accent) hover:bg-(--cyan-accent)/5"
                      )}
                    >
                      {plan.priceMonthly === 0 ? "Comenzar" : "Seleccionar plan"}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
