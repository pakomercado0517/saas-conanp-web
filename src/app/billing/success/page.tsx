"use client";

import { Suspense } from "react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { BillingSuccessContent } from "@/features/subscriptions/components/BillingSuccessContent";

function BillingSuccessFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">Cargando…</p>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-(--light-grey) dark:bg-(--navy-deep)">
        <Suspense fallback={<BillingSuccessFallback />}>
          <BillingSuccessContent />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
