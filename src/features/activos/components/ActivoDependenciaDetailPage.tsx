"use client";

import { DependenciaOperacionShell } from "@/features/dependencias/components/DependenciaOperacionShell";
import { AreaContextProvider } from "@/features/organizations/context/AreaContext";
import { ActivoDetail } from "./ActivoDetail";

export interface ActivoDependenciaDetailPageProps {
  dependenciaId: string;
  prestadorId: string;
  /** Organización (ANP) donde está registrado el activo en API. */
  areaId: string;
  activoId: string;
}

export function ActivoDependenciaDetailPage({
  dependenciaId,
  prestadorId,
  areaId,
  activoId,
}: ActivoDependenciaDetailPageProps) {
  const backHref = `/dependencias/${dependenciaId}/prestadores/${prestadorId}?areaId=${encodeURIComponent(areaId)}`;

  return (
    <DependenciaOperacionShell
      dependenciaId={dependenciaId}
      title="Activo"
      description="Detalle, edición y requisitos del activo asociado al prestador."
      backHref={backHref}
      backLabel="Volver al prestador"
    >
      <AreaContextProvider areaId={areaId}>
        <ActivoDetail areaId={areaId} activoId={activoId} />
      </AreaContextProvider>
    </DependenciaOperacionShell>
  );
}
