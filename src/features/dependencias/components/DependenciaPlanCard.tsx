"use client";

import { CreditCard, ArrowUpRight } from "lucide-react";

interface DependenciaPlanCardProps {
  areasCount: number;
  maxAreas: number;
  /** Nombre del plan cuando viene del backend; si no se pasa, se muestra "Plan actual" */
  planName?: string | null;
}

export function DependenciaPlanCard({
  areasCount,
  maxAreas,
  planName = null,
}: DependenciaPlanCardProps) {
  const areasUsage = maxAreas > 0 ? Math.min(areasCount / maxAreas, 1) : 0;
  const displayName = planName ?? "Plan actual";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-(--cyan-accent)" aria-hidden />
          <h3 className="font-bold uppercase text-(--navy-deep) dark:text-white">
            {displayName}
          </h3>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-semibold text-(--cyan-accent) transition-colors hover:text-(--cyan-hover)"
        >
          Mejorar plan
          <ArrowUpRight className="size-3" aria-hidden />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-(--slate-text)">Áreas</span>
            <span className="font-semibold text-(--navy-deep) dark:text-white">
              {areasCount} / {maxAreas}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-(--cyan-accent) transition-all duration-500"
              style={{ width: `${areasUsage * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
