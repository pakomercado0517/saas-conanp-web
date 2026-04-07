"use client";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { BillingCancelContent } from "@/features/subscriptions/components/BillingCancelContent";

export default function BillingCancelPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-(--light-grey) dark:bg-(--navy-deep)">
        <BillingCancelContent />
      </div>
    </AuthGuard>
  );
}
