"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { SubscriptionManagement } from "@/features/subscriptions/components/SubscriptionManagement";

export function AreaSuscripcionRedirectOrPanel() {
  const router = useRouter();
  const { dependenciaId, isLoading } = useAreaContext();

  useEffect(() => {
    if (!isLoading && dependenciaId != null && dependenciaId !== "") {
      router.replace(`/dependencias/${dependenciaId}/suscripcion`);
    }
  }, [isLoading, dependenciaId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Cargando…
        </p>
      </div>
    );
  }

  if (dependenciaId != null && dependenciaId !== "") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Redirigiendo…
        </p>
      </div>
    );
  }

  return <SubscriptionManagement />;
}
