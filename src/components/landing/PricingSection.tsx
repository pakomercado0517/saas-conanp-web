"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = {
  monthly: {
    basico: {
      price: 1200,
      period: "mes",
      original: undefined as number | undefined,
    },
    profesional: {
      price: 3500,
      period: "mes",
      original: undefined as number | undefined,
    },
  },
  annual: {
    basico: { price: 960, period: "mes", original: 1200 },
    profesional: { price: 2800, period: "mes", original: 3500 },
  },
};

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const plans = isAnnual ? PLANS.annual : PLANS.monthly;

  return (
    <section className="bg-(--navy-deep) py-24 text-white" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold">Planes de Suscripción</h2>
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
              Anual{" "}
              <span className="ml-1 rounded bg-(--cyan-accent)/10 px-2 py-0.5 text-xs font-bold text-(--cyan-accent)">
                -20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Básico */}
          <div className="rounded-2xl border border-white/5 bg-(--navy-light) p-8 transition-all hover:border-(--cyan-accent)/20">
            <h3 className="mb-2 text-xl font-bold">Básico</h3>
            <p className="mb-6 text-sm text-white/60">
              Para ANP con operaciones emergentes.
            </p>
            <div className="mb-8">
              <span className="text-4xl font-bold">
                ${plans.basico.price.toLocaleString("es-MX")}
              </span>
              <span className="text-white/40">/{plans.basico.period}</span>
              {isAnnual && plans.basico.original && (
                <span className="ml-2 text-sm text-white/40 line-through">
                  ${plans.basico.original.toLocaleString("es-MX")}
                </span>
              )}
            </div>
            <ul className="mb-8 space-y-4 text-sm opacity-80">
              <PlanItem icon={CheckCircle2} label="Hasta 50 eventos/mes" />
              <PlanItem icon={CheckCircle2} label="5 Prestadores activos" />
              <PlanItem icon={CheckCircle2} label="Reportes básicos" />
              <PlanItem icon={XCircle} label="Stripe Integration" negative />
            </ul>
            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center rounded border border-(--cyan-accent)/30 py-3 font-semibold text-(--cyan-accent) transition-colors hover:bg-(--cyan-accent)/5"
            >
              Comenzar
            </Link>
          </div>

          {/* Profesional - Recomendado */}
          <div className="relative scale-105 rounded-2xl border-2 border-(--cyan-accent) bg-(--navy-light) p-8 shadow-2xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-(--cyan-accent) px-4 py-1 text-xs font-bold uppercase tracking-widest text-(--navy-deep)">
              Recomendado
            </div>
            <h3 className="mb-2 text-xl font-bold text-(--cyan-accent)">
              Profesional
            </h3>
            <p className="mb-6 text-sm text-white/60">
              Gestión integral para zonas de alto tráfico.
            </p>
            <div className="mb-8">
              <span className="text-4xl font-bold">
                ${plans.profesional.price.toLocaleString("es-MX")}
              </span>
              <span className="text-white/40">/{plans.profesional.period}</span>
              {isAnnual && plans.profesional.original && (
                <span className="ml-2 text-sm text-white/40 line-through">
                  ${plans.profesional.original.toLocaleString("es-MX")}
                </span>
              )}
            </div>
            <ul className="mb-8 space-y-4 text-sm">
              <PlanItem icon={CheckCircle2} label="Eventos Ilimitados" />
              <PlanItem icon={CheckCircle2} label="Prestadores Ilimitados" />
              <PlanItem icon={CheckCircle2} label="Pagos con Stripe" />
              <PlanItem icon={CheckCircle2} label="Gestión de Brazaletes" />
            </ul>
            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center rounded bg-(--cyan-accent) py-3 font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
            >
              Seleccionar Plan
            </Link>
          </div>

          {/* Empresarial */}
          <div className="rounded-2xl border border-white/5 bg-(--navy-light) p-8 transition-all hover:border-(--cyan-accent)/20">
            <h3 className="mb-2 text-xl font-bold">Empresarial</h3>
            <p className="mb-6 text-sm text-white/60">
              Solución customizada multiorganización.
            </p>
            <div className="mb-8">
              <span className="text-4xl font-bold">Contactar</span>
            </div>
            <ul className="mb-8 space-y-4 text-sm opacity-80">
              <PlanItem icon={CheckCircle2} label="Multi-tenant avanzado" />
              <PlanItem icon={CheckCircle2} label="API Access for Custom ERP" />
              <PlanItem icon={CheckCircle2} label="Soporte 24/7 Dedicado" />
              <PlanItem icon={CheckCircle2} label="SLAs Garantizados" />
            </ul>
            <Link
              href="mailto:ventas@conanp.gob.mx"
              className="flex w-full items-center justify-center rounded border border-white/20 py-3 font-semibold text-white transition-colors hover:bg-white/5"
            >
              Hablar con Ventas
            </Link>
          </div>
        </div>
      </div>
    </section>
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
