"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { ActivosList } from "@/features/activos/components/ActivosList";

interface ActivosAreaRedirectProps {
  areaId: string;
}

export function ActivosAreaRedirect({ areaId }: ActivosAreaRedirectProps) {
  const router = useRouter();
  const { data: org, isLoading } = useOrganization(areaId);
  const inicioHref = getDashboardHref(areaId, "");

  useEffect(() => {
    if (isLoading || !org) return;
    const depId = org.dependenciaId;
    if (depId) {
      router.replace(`/dependencias/${depId}/prestadores`);
    }
  }, [org, isLoading, router]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (org?.dependenciaId) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <p className="text-sm text-slate-500">
          Redirigiendo a prestadores de la dependencia…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Activos y requisitos
      </h1>

      <ActivosList areaId={areaId} />

      <p className="text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Volver al inicio del área
        </Link>
      </p>
    </div>
  );
}
