"use client";

import { DependenciaOperacionShell } from "@/features/dependencias/components/DependenciaOperacionShell";
import { PrestadorDependenciaDetail } from "@/features/prestadores/components/PrestadorDependenciaDetail";

interface PrestadorDependenciaDetailPageProps {
  dependenciaId: string;
  prestadorId: string;
  areaIdHint: string | null;
}

export function PrestadorDependenciaDetailPage({
  dependenciaId,
  prestadorId,
  areaIdHint,
}: PrestadorDependenciaDetailPageProps) {
  return (
    <DependenciaOperacionShell
      dependenciaId={dependenciaId}
      title="Prestador"
      description="Datos del perfil y permisos por actividad en las ANP donde está registrado."
      backHref={`/dependencias/${dependenciaId}/prestadores`}
      backLabel="Volver al listado de prestadores"
    >
      <PrestadorDependenciaDetail
        dependenciaId={dependenciaId}
        prestadorId={prestadorId}
        areaIdHint={areaIdHint}
      />
    </DependenciaOperacionShell>
  );
}
