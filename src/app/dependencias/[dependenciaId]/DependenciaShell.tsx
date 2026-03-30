"use client";

import type { ReactNode } from "react";
import { DependenciaContextProvider } from "@/features/dependencias/context/DependenciaContext";

interface DependenciaShellProps {
  dependenciaId: string;
  children: ReactNode;
}

export function DependenciaShell({
  dependenciaId,
  children,
}: DependenciaShellProps) {
  return (
    <DependenciaContextProvider dependenciaId={dependenciaId}>
      {children}
    </DependenciaContextProvider>
  );
}
