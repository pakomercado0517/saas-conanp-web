"use client";

import { DependenciaContextProvider } from "@/features/dependencias/context/DependenciaContext";
import { DependenciaHub } from "@/features/dependencias/components/DependenciaHub";

interface DependenciaHubPageProps {
  dependenciaId: string;
}

export function DependenciaHubPage({
  dependenciaId,
}: DependenciaHubPageProps) {
  return (
    <DependenciaContextProvider dependenciaId={dependenciaId}>
      <DependenciaHub dependenciaId={dependenciaId} />
    </DependenciaContextProvider>
  );
}
