"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/shared/components/EmptyState";

export function AlertasSection() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <AlertTriangle className="size-5 text-amber-500" aria-hidden />
        Alertas
      </h2>
      <EmptyState message="No hay alertas en este momento." />
    </div>
  );
}
