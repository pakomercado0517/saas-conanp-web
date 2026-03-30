"use client";

import { DependenciaHub } from "@/features/dependencias/components/DependenciaHub";

interface DependenciaHubPageProps {
  dependenciaId: string;
}

export function DependenciaHubPage({
  dependenciaId,
}: DependenciaHubPageProps) {
  return <DependenciaHub dependenciaId={dependenciaId} />;
}
