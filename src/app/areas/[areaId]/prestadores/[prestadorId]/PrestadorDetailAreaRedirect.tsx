"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { PrestadorDetail } from "@/features/prestadores/components/PrestadorDetail";

interface PrestadorDetailAreaRedirectProps {
  areaId: string;
  prestadorId: string;
}

export function PrestadorDetailAreaRedirect({
  areaId,
  prestadorId,
}: PrestadorDetailAreaRedirectProps) {
  const router = useRouter();
  const { data: org, isLoading } = useOrganization(areaId);

  useEffect(() => {
    if (isLoading || !org) return;
    const depId = org.dependenciaId;
    if (depId) {
      router.replace(
        `/dependencias/${depId}/prestadores/${prestadorId}?areaId=${encodeURIComponent(areaId)}`
      );
    }
  }, [org, isLoading, router, areaId, prestadorId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center p-8">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (org?.dependenciaId) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center p-8">
        <p className="text-sm text-slate-500">Redirigiendo…</p>
      </div>
    );
  }

  return <PrestadorDetail areaId={areaId} prestadorId={prestadorId} />;
}
