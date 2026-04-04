"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Loader2,
  Menu,
  RefreshCw,
} from "lucide-react";
import { getActiveDependenciaNavItem } from "@/shared/config/dependenciaNav";
import { useDependenciaContext } from "../context/DependenciaContext";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import { DependenciaSidebar } from "./DependenciaSidebar";
import { DependenciaMobileDrawer } from "./DependenciaMobileDrawer";

interface DependenciaAppLayoutProps {
  dependenciaId: string;
  children: React.ReactNode;
}

export function DependenciaAppLayout({
  dependenciaId,
  children,
}: DependenciaAppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pathname = usePathname() ?? "";
  const { dependencia, areas, refetch } = useDependenciaContext();

  const areaIds = useMemo(() => areas.map((a) => a.id), [areas]);
  const { isAdminInAnyArea, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  const adminForNav = !rolesLoading && isAdminInAnyArea;

  const activeItem = getActiveDependenciaNavItem(pathname, dependenciaId);
  const headerTitle =
    activeItem?.breadcrumbTitle ?? activeItem?.label ?? "Dependencia";

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-(--background-light) text-slate-900 dark:bg-(--background-dark) dark:text-slate-100"
      data-shell="dependencia"
    >
      <DependenciaSidebar
        dependenciaId={dependenciaId}
        dependenciaName={dependencia?.name ?? null}
        isAdminInAnyArea={adminForNav}
      />
      <DependenciaMobileDrawer
        dependenciaId={dependenciaId}
        isAdminInAnyArea={adminForNav}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:h-16 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-ml-1 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden dark:hover:bg-slate-800"
              aria-label="Abrir menú"
            >
              <Menu className="size-6" aria-hidden />
            </button>
            <Link
              href="/select-organization"
              className="hidden truncate text-slate-400 transition-colors hover:text-(--cyan-accent) sm:inline"
            >
              Dependencias
            </Link>
            <ChevronRight
              className="hidden size-4 shrink-0 text-slate-400 sm:block"
              aria-hidden
            />
            <span className="truncate text-slate-400">
              {dependencia?.name ?? "…"}
            </span>
            <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden />
            <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
              {headerTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-(--slate-text) transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-70"
            aria-label="Actualizar"
          >
            {isRefreshing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-4" aria-hidden />
            )}
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-(--light-grey) dark:bg-(--navy-deep)">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
