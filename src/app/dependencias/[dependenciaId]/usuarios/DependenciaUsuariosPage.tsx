"use client";

import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { DependenciaOperacionShell } from "@/features/dependencias/components/DependenciaOperacionShell";
import { DependenciaUsuariosHub } from "../DependenciaUsuariosHub";

interface DependenciaUsuariosPageProps {
  dependenciaId: string;
}

export function DependenciaUsuariosPage({
  dependenciaId,
}: DependenciaUsuariosPageProps) {
  const { dependencia } = useDependenciaContext();

  return (
    <DependenciaOperacionShell
      dependenciaId={dependenciaId}
      title="Usuarios por área"
      description={
        dependencia?.name
          ? `Las membresías se administran por cada ANP de ${dependencia.name}. Elige un área para abrir la gestión de usuarios.`
          : "Elige un área para abrir la gestión de usuarios."
      }
    >
      <DependenciaUsuariosHub />
    </DependenciaOperacionShell>
  );
}
