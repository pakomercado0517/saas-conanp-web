"use client";

import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { DependenciaOperacionShell } from "@/features/dependencias/components/DependenciaOperacionShell";
import { PrestadoresDependenciaList } from "@/features/prestadores/components/PrestadoresDependenciaList";

interface PrestadoresDependenciaPageProps {
  dependenciaId: string;
}

export function PrestadoresDependenciaPage({
  dependenciaId,
}: PrestadoresDependenciaPageProps) {
  const { dependencia } = useDependenciaContext();

  return (
    <DependenciaOperacionShell
      dependenciaId={dependenciaId}
      title="Prestadores"
      description={
        dependencia?.name
          ? `Ámbito: ${dependencia.name}. Listado agregado de las áreas naturales protegidas de esta dependencia.`
          : "Listado agregado de las áreas naturales protegidas de esta dependencia."
      }
    >
      <PrestadoresDependenciaList dependenciaId={dependenciaId} />
    </DependenciaOperacionShell>
  );
}
