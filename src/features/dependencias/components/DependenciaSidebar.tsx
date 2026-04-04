"use client";

import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import { DependenciaNavLinks } from "./DependenciaNavLinks";
import { DependenciaUserBlock } from "./DependenciaUserBlock";

interface DependenciaSidebarProps {
  dependenciaId: string;
  dependenciaName: string | null;
  isAdminInAnyArea: boolean;
}

export function DependenciaSidebar({
  dependenciaId,
  dependenciaName,
  isAdminInAnyArea,
}: DependenciaSidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-(--navy-sidebar) lg:flex">
      <div className="flex items-center gap-3 p-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-(--primary)">
          <Leaf className="size-5 text-white" aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-white">
            CONANP ERP
          </h1>
          <p className="truncate text-xs font-medium text-slate-400" title={dependenciaName ?? undefined}>
            {dependenciaName ?? "Dependencia"}
          </p>
        </div>
      </div>

      <DependenciaNavLinks
        dependenciaId={dependenciaId}
        pathname={pathname}
        isAdminInAnyArea={isAdminInAnyArea}
      />
      <DependenciaUserBlock dependenciaId={dependenciaId} />
    </aside>
  );
}
