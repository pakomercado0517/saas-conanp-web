"use client";

import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { DependenciaOperacionShell } from "@/features/dependencias/components/DependenciaOperacionShell";
import { DependenciaUsuariosByAreaPanel } from "@/features/dependencias/components/DependenciaUsuariosByAreaPanel";

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
          ? `Membresías e invitaciones por cada ANP de ${dependencia.name}. Si hay varias áreas, elige una pestaña; la gestión es la misma que en el panel del área.`
          : "Membresías e invitaciones por área natural protegida."
      }
    >
      <DependenciaUsuariosByAreaPanel dependenciaId={dependenciaId} />
    </DependenciaOperacionShell>
  );
}
