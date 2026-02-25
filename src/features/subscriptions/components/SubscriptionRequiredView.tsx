"use client";

import Link from "next/link";
import { CreditCard, AlertCircle } from "lucide-react";
import { getDashboardHref } from "@/shared/config/dashboardNav";

interface SubscriptionRequiredViewProps {
  areaId: string;
  message?: string;
}

export function SubscriptionRequiredView({
  areaId,
  message,
}: SubscriptionRequiredViewProps) {
  const suscripcionHref = getDashboardHref(areaId, "/suscripcion");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-amber-200 bg-amber-50/80 p-8 text-center dark:border-amber-800 dark:bg-amber-950/30">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
          <CreditCard className="h-7 w-7 text-amber-600 dark:text-amber-400" aria-hidden />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">
          Suscripción requerida
        </h2>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          {message ??
            "Esta área no tiene una suscripción activa. Contrata un plan para acceder al dashboard y gestionar actividades, eventos y reportes."}
        </p>
        <Link
          href={suscripcionHref}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
        >
          <CreditCard className="h-5 w-5" aria-hidden />
          Ver planes y contratar
        </Link>
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
        Solo los administradores del área pueden gestionar la suscripción.
      </p>
    </div>
  );
}
