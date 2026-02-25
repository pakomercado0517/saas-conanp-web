"use client";

import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import { DashboardNavLinks } from "./DashboardNavLinks";
import { DashboardUserBlock } from "./DashboardUserBlock";

interface DashboardSidebarProps {
  areaId: string;
}

/** Sidebar desktop: oculto en móvil, visible desde lg. Menú dinámico vía DashboardNavLinks. */
export function DashboardSidebar({ areaId }: DashboardSidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-(--navy-sidebar) lg:flex">
      <div className="flex items-center gap-3 p-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-(--primary)">
          <Leaf className="size-5 text-white" aria-hidden />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          CONANP ERP
        </h1>
      </div>

      <DashboardNavLinks areaId={areaId} pathname={pathname} />
      <DashboardUserBlock areaId={areaId} />
    </aside>
  );
}
