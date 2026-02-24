"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Bell, Plus, Menu } from "lucide-react";
import { getActiveNavItem } from "@/shared/config/dashboardNav";

interface DashboardHeaderProps {
  organizationId: string;
  /** Acción principal (ej. "Nueva Área"). Si no se pasa, no se muestra botón. */
  primaryAction?: { label: string; href: string };
  /** En móvil: abre el drawer de navegación. */
  onMenuClick?: () => void;
}

export function DashboardHeader({
  organizationId,
  primaryAction,
  onMenuClick,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const activeItem = getActiveNavItem(pathname ?? "", organizationId);
  const breadcrumbTitle =
    activeItem?.breadcrumbTitle ?? activeItem?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:h-16 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="-ml-1 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-6" aria-hidden />
          </button>
        )}
        <span className="truncate text-slate-400">Dashboard</span>
        <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="truncate font-semibold">{breadcrumbTitle}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 lg:gap-4">
        <div className="hidden items-center gap-2 rounded-full bg-(--primary)/10 px-3 py-1 sm:flex">
          <span className="size-2 rounded-full bg-(--primary) animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-(--primary)">
            Sistema Activo
          </span>
        </div>
        <button
          type="button"
          className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Notificaciones"
        >
          <Bell className="size-5" aria-hidden />
        </button>
        {primaryAction && (
          <Link
            href={primaryAction.href}
            className="flex items-center gap-2 rounded-lg bg-(--primary) px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--primary)/90 lg:px-4"
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">{primaryAction.label}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
